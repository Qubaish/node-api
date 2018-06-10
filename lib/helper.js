const moment    = require('moment');
const config    = require("../core/config");

function filterUrl(url){
    return url.trim().replace(/^(https?:\/\/)?(www\.)?/,'');
}

function outletDateRange(){
    return moment.utc().subtract(config.outlet.dateRange, 'months').format();
}

function apiDateRange(){
    const hash = {};
    hash.startDate = moment().subtract(config.api.dateRange[0], 'months').format('YYYY-MM');
    hash.endDate = moment().subtract(config.api.dateRange[1], 'months').format('YYYY-MM');
    return hash;
}

function mapSuccessHash(res){
    const hash = {};
    if(res.meta.status == "Error"){
        hash.data = [];
        hash.statusCode = res.meta.error_code;
        hash.msg = res.meta.error_message;
    }else{
        hash.data = res.unique_visitors;
        hash.statusCode = 200;
        hash.msg = res.meta.status;
    }
    return hash;
}

function mapErrorHash(error){
    const hash = {};
    hash.data = [];
    hash.statusCode = error.status;
    hash.msg = error.statusText;
    return hash;
}

function outletFilter(time){ // working on that
    if(config.api.okDomain){
        return "(domain_is_valid = true or domain_is_valid is NULL)"
    }else{
        return "domain_is_valid = false"
    }
}

function mapVisitorData(data, url){
    const tmpJson = {};
    tmpJson.url = url;
    tmpJson.visitors = JSON.stringify(data);
    return tmpJson;
}

exports.filterUrl = filterUrl;
exports.outletDateRange = outletDateRange;
exports.apiDateRange = apiDateRange;
exports.mapSuccessHash = mapSuccessHash;
exports.mapErrorHash = mapErrorHash;
exports.mapVisitorData = mapVisitorData;
