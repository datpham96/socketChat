const login = require('./login');
const eventConfig = require('./config');
const messageService = require('../../libs/services/messageService')

class roomProcess {

    constructor(socket, request) {
        let mMessageService = new messageService();
        //status confirm
        socket.on(eventConfig.onEvent.statusConfirm, function(data){
            if(data.status){

            }else{

            }
        })
    }
}

module.exports = roomProcess;