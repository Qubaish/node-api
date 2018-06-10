const express = require("express");
const config  = require("./core/config");
const apiRouter    = require("./routes/api");
const helmet = require("helmet");
const cors = require("cors");

var cluster=null;

if(config.api.cluster){
    cluster = require("cluster");
    cluster.on('exit', function (worker) {
        // Replace the dead worker,
        // we're not sentimental
        esc.info('Worker %d died :(', worker.id);
        cluster.fork();
    });
}

if (cluster && cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
}else {
    const app = express();

    app.use(cors());
    app.use(helmet());


    app.response.success = function success(content) {
        this.json({
            status: {
                code: 0,
                message: "OK"
            },
            data: content
        });
    };

    app.response.error = function error(message) {
        this.json({
            status: {
                code: 1,
                message: message
            }
        });
    };


    app.use("/outlet", apiRouter);

    app.listen(config.api.port, function () {
        console.info("Server started on port " + config.api.port);
    });

}