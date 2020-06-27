const db = require('../models');
const validate =  require('../libs/MyValidate');
const myFunc = require('../libs/myFunc');

module.exports = class controller{
    constructor(ctx){
        this.model = db;
        this.validate = validate;
        this.ctx = ctx;
        this.myFunc = myFunc;
    }
    
    response(data, status, header){
        data = data || {};
        status = status || 200;
        header = header || {};

        this.ctx.body = data;
        this.ctx.status = status;
    }

    getBody(){
        return this.ctx.request.body;
    }

    getInput(key, defaultVal){
        defaultVal = defaultVal || '';
        return this.ctx.request.body[key] || defaultVal;
    }
}