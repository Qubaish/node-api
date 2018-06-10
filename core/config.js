const fs = require("fs");
const path = require("path");
const esc = require("./esc");
const strip = require("strip-json-comments");
let file = "config.json";
let previous = "";
const parent = ".." + path.sep;
function fileExistsSync(path) {
    try {
        return fs.statSync(path).isFile();
    }
    catch (err) {
        return false;
    }
}
while (!fileExistsSync(file)) {
    file = path.join(parent, file);
    const norm = path.resolve(file);
    if (norm === previous) {
        throw new Error("Could not locate the JSON config file!");
    }
    previous = norm;
}
esc.info(`Reading JSON config file from "${file}"`);
let config;
try {
    config = JSON.parse(strip(fs.readFileSync(file, "utf8")));
    if (config && config.hasOwnProperty("environment")) {
        esc.info(`Loading the environment: "${config.environment}"`);
        const env = config.environment;
        config = config[config.environment];
        config.environment = env;
    }
    else {
        esc.error(`Could not locate the environment in the config file...`);
    }
}
catch (e) {
    esc.error(`Could not read or parse the JSON config file "${file}"`);
}
module.exports = config;

//# sourceMappingURL=config.js.map
