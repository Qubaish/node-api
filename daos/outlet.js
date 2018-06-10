const query = require("../core/database/query");

async function getOutlets(time, min, max) {

    // takes 37 seconds on staging on whole data
    const sql = `SELECT DISTINCT(url), id FROM outlets WHERE media_subtype IN ('website', 'blogs', 'news', 'corporate', 'forum') 
                    and (stats_updated_at <= '${time}' or stats_updated_at is NULL ) and id between ${min} and ${max} order by id ASC`; // limit 5 is only for testing
    const results = await query.query(sql, []);

    if (results.length > 0) {
        return results;
    }
    else {
        return [];
    }

}

exports.getOutlets = getOutlets;

async function updateOutletStatsTime(url){
    const sql = "Update outlets set stats_updated_at =  NOW() where url = $1";
    const results = await query.query(sql, [url]);
}

exports.updateOutletStatsTime = updateOutletStatsTime;

async function countRows(){

    const sql = "SELECT COUNT(id) as count, MIN(id) as min FROM outlets";
    const results = await query.query(sql, []);
    return results[0];
}

exports.countRows = countRows;