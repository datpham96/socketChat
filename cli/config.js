const crypto = require("crypto");
const fs = require("fs");
const path = require('path');

var configFunc = {
    "key:generate": () => {
        crypto.randomBytes(48, (err, buffer) => {
            let content = require("../config/app.json");
            content.appKey = buffer.toString('hex');
            fs.writeFileSync(path.join(basePath, "config/app.json"), JSON.stringify(content));
            console.log('generate key is: ' + content.appKey);
        });
    },
    "config:port": (port) => {
        let content = require("../config/app.json");
        content.port = port;
        fs.writeFileSync(path.join(basePath, "config/app.json"), JSON.stringify(content));
        console.log('config port to: ' + port + ' success~');
    }
}


module.exports = configFunc;