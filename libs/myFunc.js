const crypto = require("crypto");
const appConfig = require("../config/app.json");
const replaceAll = require('replaceall');

module.exports = {
    isEmpty: (val) => {
        if (!val)
            return true;
        var typeOfVal = typeof val;
        var retVal = false;
        switch (typeOfVal) {
            case 'array':
                retVal = (val.length < 1) ? true : false;
                break;
            case 'object':
                var arrKey = Object.keys(val);
                retVal = (arrKey.length < 1) ? true : false;
                break;
            case 'string':
                retVal = (val.length < 1) ? true : false;
                break;
        }

        return retVal;
    },
    makehash: (val) => {
        return crypto.createHmac('sha256', appConfig.appKey).update(val).digest('hex');
    },
    replace: (str, find, replace) => {
        return replaceAll(find, replace, str);
    }
};