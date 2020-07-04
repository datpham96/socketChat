const authServer = require('../../libs/services/authService');
const redisService = require('../../libs/services/redisService');
const messageService = require('../../libs/services/messageService');
const messageFunc = require('./myFunc');
const config = require('../../config/app.json');

class login {
    constructor(socket){
        this.socket = socket;
    }

    async main(accessToken){
        try {
            let mAuthServer = new authServer(accessToken);
            let mMessageService = new messageService(accessToken);
            let responseData = await mAuthServer.getUserInfo();
            //check user online va push vao redis
            let usersOnline = await redisService.get(config.redis.usersOnline) || {};
            
            if (!usersOnline[responseData.data.email]) {
                usersOnline[responseData.data.email] = {};
                usersOnline[responseData.data.email].socketId = [];
            }
            usersOnline[responseData.data.email].name = responseData.data.name;
            usersOnline[responseData.data.email].email = responseData.data.email;
            usersOnline[responseData.data.email].socketId.push(this.socket.id);
            usersOnline[responseData.data.email].status = 'online';

            await redisService.set(config.redis.usersOnline, usersOnline);

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
