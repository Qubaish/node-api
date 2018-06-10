"use strict";
const express = require('express');
const router = express.Router();
const API = require('../lib/similarweb_api');
const Helper = require('../lib/helper');
const outletDao = require('../daos/outlet');
const outletStatsDao = require('../daos/outlets_statistic');

const Memcached = require('memcached');
const config  = require("../core/config");
const memcached = new Memcached(config.memCacheServer, {retries:10,retry:10000});
Memcached.config.poolSize = 25;
const minExpireDate=3600; //1 hours
const md5 = require('md5');



router.get('/stats', async function(req, res, next) {
    
    let url = req.query.url ? Helper.filterUrl(req.query.url) : '';
    const date = Helper.outletDateRange();

    if(url){
        /// check from memcached if record exists
        memcached.get(md5(url), function(err,data){
            if(err) {
                console.log(err)
            }

            if(data){
                res.success(data);                
            }else{

                (async () => {

                    const isRecordExist = await outletStatsDao.checkFromCacheTable(url, date);
                    if(isRecordExist.length > 0){
                        cacheOutletStats(isRecordExist[0].url, isRecordExist[0].visitors_blob);
                        res.success(isRecordExist[0].visitors_blob);  /// return the data if exist in cache table
                    }else{
                        const apiResponse = await API.similarWeb(url, Helper.apiDateRange()); // similar api call
                        if(apiResponse.statusCode == 200){
                            outletStatsDao.add(Helper.mapVisitorData(apiResponse.data, url));  // insert data in visitors table
                            outletDao.updateOutletStatsTime(url);
                            cacheOutletStats(url, apiResponse.data);
                            res.success(apiResponse.data);
                        }else{
                            res.error(apiResponse.msg);
                        }
                    }
                
                })();
            }
        });

        
    }else{
        res.error("Outlet URL is required");
    }
});

const cacheOutletStats  = (url, data) => {
    memcached.set(md5(url), Object.values(data), minExpireDate, function(err){
        if(err){
            console.log(err);
        }
    });
}

module.exports = router;