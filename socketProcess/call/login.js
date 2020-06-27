const redisService = require('../../libs/services/redisService');
const config = require('../../config/app.json');
const authServer = require('../../libs/services/authService');

class login {
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
    }

    async main(data, callback) {
        try {
            let mAuthServer = new authServer(data.accessToken);
            let responseData = await mAuthServer.getUserInfo();
            let usersOnline = await redisService.get(config.redis.usersOnline) || {};

            if (!usersOnline[responseData.data.id]) {
                usersOnline[responseData.data.id] = {};
                usersOnline[responseData.data.id].socketId = [];
            }
            usersOnline[responseData.data.id].name = responseData.data.name;
            usersOnline[responseData.data.id].socketId.push(this.socket.id);
            usersOnline[responseData.data.id].status = 'online';

            if(data.isNative){
                global.arrSocketNative.push(this.socket.id);
            }
            
            await redisService.set(config.redis.usersOnline, usersOnline);
            if (callback)
                callback(this.socket.id);
        } catch (error) {
            this.socket.disconnect(true);
        }

    }
}

module.exports = login;