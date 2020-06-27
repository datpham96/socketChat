const login = require('./login');
const disconnect = require('./disconnect');
const usersOnline = require('./usersOnline');
const config = require('./config');

class userOnlineProcces{
    constructor(socket, io){
        this.io = io;
        this.socket = socket;
        let loginProcces = new login(socket, io);
        let disconnectProcces = new disconnect(socket, io);
        let usersOnlineProcces = new usersOnline(socket, io);

        socket.on(config.socket.login, async (data, callback) => {
            await loginProcces.main(data, callback);
        });

        socket.on(config.socket.usersOnline, async () => {
            await usersOnlineProcces.main();
        });
         
        socket.on(config.socket.disconnect, async () => {
            await disconnectProcces.main();
        });
    }


   
      
}

module.exports = userOnlineProcces;