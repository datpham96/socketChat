const authServer = require('../../libs/services/authService');
const messageService = require('../../libs/services/messageService');
const messageFunc = require('./myFunc');
class login {
    constructor(socket){
        this.socket = socket
    }

    async main(accessToken){
        try {
            let mAuthServer = new authServer(accessToken);
            let mMessageService = new messageService(accessToken);
            let responseData = await mAuthServer.getUserInfo();
            
            if(responseData.data.email){
                //join room current User
                this.socket.join(messageFunc.buildRoomName(responseData.data.email));
                let listRoom = await mMessageService.listRoomByEmail(responseData.data.email);
                if(listRoom.data){
                    for(let item of listRoom.data){
                        //join room added 
                        this.socket.join(messageFunc.buildRoomName(item.roomId));
                    }
                }
            }
        } catch (error) {
            console.log(error)
            this.socket.disconnect(true);
        }
        
    }
}
module.exports = login;
