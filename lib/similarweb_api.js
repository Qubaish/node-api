const axios = require("axios");
const config = require("../core/config");
const Helper    = require('../lib/helper');
const outletDao        = require('../daos/outlet');
const outletStatsDao   = require('../daos/outlets_statistic');


/// get visitors from similarweb api
async function similarWeb(domain, apiDateRange) {

    const url = `${config.api.host}${domain}/unique-visitors/desktop_mau?api_key=${config.api.key}&start_date=${apiDateRange.startDate}&end_date=${apiDateRange.endDate}&main_domain_only=${config.api.main_domain_only}`;

    try {
        const res = await axios.get(url);
        return Helper.mapSuccessHash(res.data);
    } catch (error) {
        return Helper.mapErrorHash(error.response);
    }
}

exports.similarWeb = similarWeb;

async function callAndInsertOutletStatsData(url){

    const apiResponse = await similarWeb(url, Helper.apiDateRange()); // similarweb third party api

    if(apiResponse.statusCode == 200){
        outletStatsDao.add(Helper.mapVisitorData(apiResponse.data, url));  // insert data in visitors table
        outletDao.updateOutletStatsTime(url); // update last updated api time
        console.log("URL Is valid =>", url);
    }else{
        console.log("URL Is Not valid =>", url);
    }
    // esc.log(apiData.msg);
}

exports.callAndInsertOutletStatsData = callAndInsertOutletStatsData;

async function isOutletStatsExist(url, date){
    const isExist = await outletStatsDao.isStatsExist(url, date);
    return isExist.count > 0 ? true : false;
}

exports.isOutletStatsExist = isOutletStatsExist;