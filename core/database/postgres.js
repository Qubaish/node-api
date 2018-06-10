/**
 * Created by sergiomonteiro on 27/12/2017.
 */
const pg = require("pg");
const config = require("../config");
const esc = require("../esc");

const options = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    min: config.database.min,
    max: config.database.max,
    idleTimeoutMillis: config.database.idle,
    connectionTimeoutMillis: config.database.timeout,
    log: false
};

const pool = new pg.Pool(options);

pool.on("error", function (err, client) {
    esc.error(`Error with the database pooler: "${err.message}"`);
    esc.error(`Stack:`);
    esc.error(err.stack);
});


module.exports = pool;