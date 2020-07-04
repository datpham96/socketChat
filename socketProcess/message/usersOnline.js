const redisService = require('../../libs/services/redisService');
const appConfig = require('../../config/app.json');
const messageService = require('../../libs/services/messageService')
const messageFunc = require('./myFunc');

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
                    this.io.to(socketId[i]).emit('invite', data);
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
            //join room added 
            this.socket.join(messageFunc.buildRoomName(data.roomId));
            //add room to csdl
            try {
                await this.messageService.addRoom(data.email, data.roomId)
            } catch (error) {
                console.log(error)
            }
        }
    }
 
    getUserOnline(){
        

        
        console.log(this.socket.id,'socket')
        // for(let index in usersOnline){
        //     if(usersOnline[index].socketId.includes(this.socket.id)){
        //         newUser[index] = usersOnline[index];
        //     }
        // }

        // console.log(newUser,'newUser')
        // let newUser = {};

        // for(let index in usersOnline){
        //     if(usersOnline[index].socketId.includes(this.socket.id)){
        //         newUser[index] = usersOnline[index];
        //     }
        // }

        // this.socket.broadcast.emit(config.socket.usersOnline, newUser);
        
    }
}

module.exports = usersOnline;