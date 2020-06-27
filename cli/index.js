'use strict';

var fs = require('fs');
var path = require('path');
var basename = path.basename(__filename);
var lodash = require('lodash');
var cliFunc = {};
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        var cli = require(__dirname + '/' + file);
        cliFunc = lodash.merge(cliFunc, cli);
    });

module.exports = cliFunc;
