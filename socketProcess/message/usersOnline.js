const redisService = require('../../libs/services/redisService');
const appConfig = require('../../config/app.json');
const messageService = require('../../libs/services/messageService')
const messageFunc = require('./myFunc');
const typeConfig = require('./config')

class usersOnline{
    constructor(socket, io){
        this.socket = socket;
        this.io = io;
        this.messageService = new messageService();
    }

    async invite(data){
        let usersOnline = await redisService.get(appConfig.redis.usersOnline) || {};
        if(usersOnline[data.email]){
            try {
                await this.messageService.checkInvite(data.email, data.roomId)
                let socketId = usersOnline[data.email].socketId;
                for(var i in socketId){
                    this.io.to(socketId[i]).emit(typeConfig.emitEvent.invite, data);
                }
            } catch (error) {
                console.log(error)
            }
            
        }else{
            try {
                await this.messageService.inviteRoom(data.email, data.roomId)
            } catch (error) {
                console.log(error)
            }
        }
    }

    async confirmInvite(data){
        if(data.type){
            let usersOnline = await redisService.get(appConfig.redis.usersOnline) || {};
            if(usersOnline[data.email]){
                let socketId = usersOnline[data.email].socketId;
                for(var i in socketId){
                    let socket = this.io.connected[socketId[i]];
                    socket.join(messageFunc.buildRoomName(data.roomId))
                }
            }
            //add room to csdl
            try {
                await this.messageService.addRoom(data.email, data.roomId)
            } catch (error) {
                console.log(error)
            }
        }
    }
 
    async outRoom(data){
        let usersOnline = await redisService.get(appConfig.redis.usersOnline) || {};
        if(usersOnline[data.email]){
            let socketId = usersOnline[data.email].socketId;
            for(var i in socketId){
                let socket = this.io.connected[socketId[i]];
                socket.leave(messageFunc.buildRoomName(data.roomId))
            }
        }
        try {
            await this.messageService.outRoom(data.email, data.roomId)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = usersOnline;