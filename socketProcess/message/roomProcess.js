const login = require('./login');
const eventConfig = require('./config');
const messageService = require('../../libs/services/messageService')
const usersOnline = require('./usersOnline')

class roomProcess {
    constructor(socket, io) {
        let usersOnlineProcces = new usersOnline(socket, io); 

        socket.on(eventConfig.onEvent.invite, async (data) => {
            await usersOnlineProcces.invite(data);
        });

        socket.on(eventConfig.onEvent.statusConfirm, async (data) => {
            await usersOnlineProcces.confirmInvite(data);
        });

        socket.on(eventConfig.onEvent.uotRoom, async (data) => {
            await usersOnlineProcces.outRoom(data);
        });
    }

    
}

module.exports = roomProcess;