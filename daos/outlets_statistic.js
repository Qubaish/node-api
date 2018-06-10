const query = require("../core/database/query");
const esc = require("../core/esc");


//// create or update visitors data

const plsqlCreateOrUpdateOutletStatistics = `
CREATE OR REPLACE FUNCTION createOrUpdateOutletsStatistics(_url TEXT, _visitors JSONB, OUT outlet_url TEXT) AS $func$
DECLARE
    i INT;
    vistorsOld JSONB;
BEGIN
    FOR i IN 0..10 LOOP
        BEGIN
            -- Getting the id if exists
            SELECT INTO outlet_url, vistorsOld o.url, o.visitors_blob FROM outlets_statistics o WHERE o.url = _url LIMIT 1;

            -- If the select didn't bring any row back, we insert
            IF NOT FOUND THEN
                INSERT INTO outlets_statistics (url, visitors_blob, created_at, updated_at) VALUES(
                    _url, _visitors, NOW(), NOW())
                RETURNING outlets_statistics.url INTO outlet_url;
            ELSE
                UPDATE outlets_statistics SET url = _url, visitors_blob = vistorsOld || _visitors, updated_at =  NOW() WHERE url = _url
                RETURNING outlets_statistics.url INTO outlet_url;
            END IF;

            -- Do nothing if a unique constraint violation happen...
            EXCEPTION WHEN UNIQUE_VIOLATION THEN
                -- Do nothing
            END;

        EXIT WHEN outlet_url IS NOT NULL;
    END LOOP;

END
$func$ LANGUAGE plpgsql;
`;

query.plsql("outlets_statistics", plsqlCreateOrUpdateOutletStatistics);

async function add(data){
    const parameters = [data.url, data.visitors];
    const sql = `Select createOrUpdateOutletsStatistics($1, $2)`;
    const results = await query.query(sql, parameters);
}

exports.add = add;

async function isStatsExist(url, date){
    const sql = "SELECT COUNT(url) as count FROM outlets_statistics WHERE url = $1 and updated_at >= $2";
    const results = await query.query(sql, [url, date]);
    return results[0];
}

exports.isStatsExist = isStatsExist;

async function checkFromCacheTable(url, date){
    const sql = "SELECT visitors_blob, url FROM outlets_statistics WHERE url = $1 and updated_at >= $2";
    const results = await query.query(sql, [url, date]);
    if(results.length > 0){
        return results;
    }else{
        return [];
    }
}

exports.checkFromCacheTable = checkFromCacheTable;