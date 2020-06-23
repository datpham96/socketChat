const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
var basename = path.basename(__filename);
var extraValidateFunc = {};


fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})
.forEach(file => {
    var validateFunc = require(__dirname + '/' + file);
    extraValidateFunc = lodash.merge(extraValidateFunc, validateFunc);
});

module.exports = extraValidateFunc;