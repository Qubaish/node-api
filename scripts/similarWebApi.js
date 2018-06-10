const esc              = require("../core/esc");
const config           = require("../core/config");
const outletDao        = require('../daos/outlet');
const outletStatsDao   = require('../daos/outlets_statistic');
const API              = require('../lib/similarweb_api');
const Helper           = require('../lib/helper');

(async function() {
    const rows = await outletDao.countRows();
    const date = Helper.outletDateRange();
    const maxRecords = config.outlet.maxRecords;

    for(let i = 1; i < Math.ceil(rows.count/maxRecords); i++){
        
        let max = maxRecords * i + rows.min;
        let min = max - maxRecords;

        const outlets = await outletDao.getOutlets(date, min, max); // get outlets data which updated time has greater than 6month ago

        outlets.map(async (outlet) => {
            const url = Helper.filterUrl(outlet.url);
            const isExistRecord = await API.isOutletStatsExist(url, date);
            if(!isExistRecord){
                API.callAndInsertOutletStatsData(url);         
            }else{
                console.log("Outlet Stats Record already exist ==>> ID: ", outlet.id);
            }
        });
        break; /// for testing
    }
})();