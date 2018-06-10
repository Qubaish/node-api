/**
 * Created by sergiomonteiro on 26/12/2017.
 */
require('log-timestamp');

function info(options){
    console.info(options);
}

function log(options){
    console.log(options);
}

function error(options){
    console.log(options)
}

function warn(options){
    console.warn(options);
}

function logSql(options){
    console.log(options.substring(0,300));
}

exports.info=info;
exports.log=log;
exports.error=error;
exports.warn=warn;
exports.logSql=logSql;

