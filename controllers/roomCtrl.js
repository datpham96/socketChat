const controller = require('./controller');
const messageFunc = require('../socketProcess/message/myFunc');
const messageConfig = require('../socketProcess/message/config');

module.exports = class roomCtrl extends controller{
    constructor(ctx){
        super(ctx);
    }

    async addRoom(){
        
    }

    async outRoom(){

    }

    async invite(){
        let validate = await this.validate(this.getBody(), {
            'roomId': 'required',
            'name': 'required',
            'email': 'required|email',
        }, {
            'roomId.required': 'Id phòng không được bỏ trống',
            'name.required': 'Tên phòng không được bỏ trống',
            'email.required': 'Email người gửi không được bỏ trống',
            'email.email': 'Email người gửi không hợp lệ'
        });
        
        if (validate.fails()) {
            return this.response(validate.messages(), 422);
            
        }
        //code
        global.messageSocket.on(messageConfig.onEvent.invite, function(data){
            global.messageSocket.emit(messageConfig.onEvent.invite + "_" + data.email, {
                data: this.getBody()
            });
        })
    }

    async index(){
        try {
            let validate = await this.validate(this.getBody(), {
                'topicId': 'required',
                'body': 'required',
                'emailSend': 'required|email',
                'emailReceive': 'required|array',
            }, {
                    'topicId.required': 'topicId không được bỏ trống',
                    'body.required': 'body không được bỏ trống',
                    'emailSend.required': 'email người gửi không được bỏ trống',
                    'emailSend.email': 'email người gửi không hợp lệ',
                    'emailReceive.required': 'email người nhạn không được bỏ trống',
                    'emailReceive.array': 'email người nhận không đúng dịnh dạng'
                });
            
            if (validate.fails()) {
                console.log(validate.messages())
                return this.response(validate.messages(), 422);
                
            }
    
            let emailSend = this.getInput('emailSend');
            let emailReceive = this.getInput('emailReceive')
            let topicId = this.getInput('topicId');
            let body = this.getInput('body', '');
            let articleId = this.getInput('articleId', '')
            let typeMessage = this.getInput('typeMessage', '')
            
            global.messageSocket.to(messageFunc.buildRoomName(topicId)).emit(messageConfig.emitEvent.sendMessage, {emailSend, topicId, body, articleId, typeMessage});
            // for(let sigleEmailReceive of emailReceive){
            //     global.messageSocket.to(messageFunc.buildRoomName(sigleEmailReceive)).emit(messageConfig.emitEvent.sendMessage, {emailSend, topicId, body, articleId});
            // }
            
            return this.response({status: true});
        } catch (error) {
            console.log(error)
            return this.response({status: false}, 422);
        }
        
    }
}