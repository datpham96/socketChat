const controller = require('./controller');

module.exports = class exampleCtrl extends controller{
    constructor(ctx){
        super(ctx);
    }

    async index(){
        try {
            this.ctx.body = {"hello": "welcome to Controller"};
        } catch (error) {
            console.log(error);
        }
        
    }
}