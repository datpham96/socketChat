const validator = require("validator");
const underscore = require("underscore");
const extraValidate = require("./extraValidate/index");
const lodash = require("lodash");
const db = require('../models');

let FuncValidate = {
    required: async (value) => {
        let result = false;
        if (value.toString().trim().length > 0) {
            result = true;
        }
        return result;
    },
    min: async (value, length) => {
        let result = false;
        if (typeof value != 'number' && value.length >= length) {
            result = true;
        }
        else if(typeof value == 'number' && value >= length) {
            result = true;
        }
        return result;
    },
    max: async (value, length) => {
        let result = false;
        if (typeof value != 'number' && value.length <= length) {
            result = true;
        }
        else if(typeof value == 'number' && value <= length) {
            result = true;
        }

        return result;
    },
    email: async (value) => {
        let result = false;
        if (validator.isEmail(value)) {
            result = true;
        }
        return result;
    },
    numeric: async (value) => {
        let result = false;
        if (validator.isNumeric(value)) {
            result = true;
        }
        return result;
    },
    exists: async (value, table, field) => {
        let result = false;
       
        if(db[table]){
            let cond = {};
            cond[field] = value;
            let dbVal =  await db[table].findOne({
                where: cond
            });
            if(dbVal){
                result = true;
            }
        }
        return result;
    },
    execValidate: async (value, strFuncParams) => {
        let info = strFuncParams.split(':');
        let funcName = info[0];
        let funcParams = [];
        if (info[1]) {
            funcParams = info[1].split(',');
        }
        let result = false;
        if(FuncValidate[funcName]){
            result = await FuncValidate[funcName](...lodash.concat([value], funcParams));
        }

        return result;
    }
};


FuncValidate = lodash.merge(FuncValidate, extraValidate);

class MyErrors {
    constructor(errors) {
        this.errors = errors || {};
    }

    fails() {
        return (Object.keys(this.errors).length);
    }

    messages() {
        return this.buildError(this.errors);
    }

    buildError() {
        let result = this.errors;
        let typeofValue = '';
        for (var key in this.errors) {
            typeofValue = typeof this.errors[key];
            switch (typeofValue) {
                case 'array':
                    this.errors[key] = this.errors[key][0]
                    break;
            }
            result[key] = this.errors[key];
        }
        return result;
    }
}

const MyValidate = async (values, arrCheck, arrMessage) => {
    let errors = {};
    let listFunc = [];
    let tmpFuncName = '';
    let tmpValue = '';
    let checkVal = true;
    let cond = '';
    let strFuncParams = '';
    for(var key in arrCheck){
        cond = arrCheck[key];
        listFunc = cond.split('|');
        tmpValue = values[key] || '';
        for(var index in listFunc){
            strFuncParams = listFunc[index];
            tmpFuncName = strFuncParams.split(':')[0];
            checkVal = await FuncValidate.execValidate(tmpValue, strFuncParams);
            if (!checkVal) {//neu gia tri ko hop le
                if (!errors[key]) {
                    errors[key] = arrMessage[key + '.' + tmpFuncName] || '';
                }
            }
        }
    }
    return new MyErrors(errors);
}

module.exports = MyValidate;