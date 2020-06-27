const controller = require('./controller');
const messageFunc = require('../socketProcess/message/myFunc');
const messageConfig = require('../socketProcess/message/config');

module.exports = class messageCtrl extends controller{
    constructor(ctx){
        super(ctx);
    }

    async index(){
        try {
            let validate = await this.validate(this.getBody(), {
                'topicId': 'required',
                'body': 'required',
                'emailSend': 'required|email',
                'emailReceive': 'required|email',
            }, {
                    'topicId.required': 'topicId không được bỏ trống',
                    'body.required': 'body không được bỏ trống',
                    'emailSend.required': 'email người gửi không được bỏ trống',
                    'emailSend.email': 'email người gửi không hợp lệ',
                    'emailReceive.required': 'email người nhạn không được bỏ trống',
                    'emailReceive.email': 'email người nhận không hợp lệ',
                });
    
            if (validate.fails()) {
                return this.response(validate.messages(), 422);
            }
    
            let emailSend = this.getInput('emailSend');
            let emailReceive = this.getInput('emailReceive')
            let topicId = this.getInput('topicId');
            let body = this.getInput('body', '');
            let articleId = this.getInput('articleId', '')

            global.messageSocket.to(messageFunc.buildRoomName(emailSend)).emit(messageConfig.emitEvent.sendMessage, {emailSend, topicId, body, articleId});
            global.messageSocket.to(messageFunc.buildRoomName(emailReceive)).emit(messageConfig.emitEvent.sendMessage, {emailSend, topicId, body, articleId});
            
            return this.response({status: true});
        } catch (error) {
            return this.response({status: false}, 422);
        }
        
    }
}