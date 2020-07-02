const redisService = require('../../libs/services/redisService');
const appConfig = require('../../config/app.json');
const config = require('./config')

class usersOnline{
    constructor(socket, io){
        this.socket = socket;
        this.io = io;
    }
 
    async getUserOnline(){
        let usersOnline = await redisService.get(appConfig.redis.usersOnline) || {};

        console.log(usersOnline)
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