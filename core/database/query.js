/**
 * Created by sergiomonteiro on 27/12/2017.
 */
const config = require("../config");
const pool = require("./postgres");
const esc = require("../esc");

let counterQuery = 0;

async function query(query, parameters) {
    let tmp = 0;
    const start = process.hrtime();

    counterQuery++;
    tmp = counterQuery;
    esc.log(`Query #${tmp}: "${query}", parameters: ${JSON.stringify(parameters)}`);

    try {
        return await pool.query(query, parameters).then(async function (results) {
            const stop = process.hrtime(start);
            const elapsed = Math.round((stop[0] * 1000) + (stop[1] / 1000000));
            esc.logSql(`Query #${tmp}: Elapsed time: ${elapsed + "ms"}`);
            return results.rows;
        });
    }
    catch (e) {
        esc.warn(`Query #${tmp} failed: "${e.message}"`);
        throw e;
    }

}

async function plsql(table, content) {
    const position = content.toLowerCase().indexOf("function") + 9;
    const name = content.substring(position, content.indexOf("(")).trim();
    return query(`select exists(select * from pg_proc where proname=$1)`, [name], undefined, undefined, undefined, false)
        .then(async function (result) {
            if (result && result.length === 1 && result[0]["exists"] === true) {
                esc.log(`PL/SQL function "${table}"/"${name}" is already existing, skipping registration`);
            }
            else {
                esc.log(`PL/SQL function "${table}"/"${name}" is not existing, registrating it`);
                return query(content, [], undefined, undefined, undefined, false)
                    .then(function () {
                        esc.log(`PL/SQL function "${table}"/"${name}" successfully registrated`);
                    })
                    .catch(function (reason) {
                        esc.error(`PL/SQL function "${table}"/"${ame}" encounter an error during registration: ${JSON.stringify(reason)}`);
                    });
            }
        })
        .catch(function (reason) {
            esc.error(`PL/SQL function "${table}"/"${name}" encounter an error during existence checking: ${JSON.stringify(reason)}`);
        });
}

exports.plsql = plsql;
exports.query = query;
