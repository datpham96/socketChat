const redisService = require('../../libs/services/redisService');
const appConfig = require('../../config/app.json');
const config = require('./config')
const sendToQueue = require('../../libs/RBMQ/sendToQueue');
const moment = require('moment');

class disconnect {
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
    }

    async main() {
        let usersOnline = await redisService.get(appConfig.redis.usersOnline) || {};

        for (let index in usersOnline) {
            if (usersOnline[index].socketId.includes(this.socket.id)) {
                // xu ly khi user disconnect trong cuoc goi
                await this.handleUserCallDisconnect(index, usersOnline);
                let objUser = {};
                let arrSocket = usersOnline[index].socketId;
                arrSocket = arrSocket.filter(socketId => socketId != this.socket.id);
                if (arrSocket.length > 0) {
                    usersOnline[index].socketId = arrSocket;
                    objUser[index] = {
                        socketId: usersOnline[index].socketId
                    }
                } else {
                    delete usersOnline[index];
                    objUser[index] = {
                        status: null,
                        socketId: []
                    }
                }

                this.io.emit(config.socket.usersOnline, objUser);
                break;
            }

        }

        await redisService.set(appConfig.redis.usersOnline, usersOnline);
    }

    sendToLogService(userId, receiveId, callIn, callOut, status, startAt, finishAt, typeCall, typeDoctor) {
        let logService = appConfig.amqp.channel.logService;
        let dataLog = {
            method: logService.method.logCallHistory,
            data: {
                userId,
                receiveId,
                callIn,
                callOut,
                status,
                startAt,
                finishAt,
                typeCall,
                typeDoctor
            }
        }
        sendToQueue(dataLog, logService.type, logService.type)
    }

    async handleUserCallDisconnect(index, usersOnline) {
        if(global.arrSocketNative.includes(this.socket.id)){
            global.arrSocketNative = global.arrSocketNative.filter(socket => {
                return socket != this.socket.id;
            });
            return;
        }
        if (usersOnline[index].status != config.userStatus.online) {
            let startAt, typeCall, typeDoctor;
            for (let key in global.callProgress) {
                let arrId = key.split(',');
                if (index == arrId[0] || index == arrId[1]) {

                    switch (global.callProgress[key].status) {
                        case config.callProgress.connecting:
                            if (!global.callProgress[key].socketId.includes(this.socket.id)) {
                                return;
                            }
                            clearTimeout(global.objTimeConnecting[arrId[0]])
                            delete global.objTimeConnecting[arrId[0]];

                            let notificationService = appConfig.amqp.channel.notificationService;
                            let dataEmit = {
                                method: notificationService.method.callToPer,
                                data: {
                                    type: notificationService.method.callToPer,
                                    endCall: true,
                                    userIdB: arrId[1],
                                }
                            }
                            sendToQueue(dataEmit, notificationService.type, notificationService.type)

                            startAt = global.callProgress[key].startAt;
                            typeCall = global.callProgress[key].typeCall;
                            typeDoctor = global.callProgress[key].typeDoctor;
                            this.sendToLogService(arrId[0], arrId[1], 0, 1, 'abandoned', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                            this.sendToLogService(arrId[1], arrId[0], 1, 0, 'missed', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)

                            // if (index == arrId[0]) {
                            //     // cancelCall
                            //     for (let id of usersOnline[arrId[1]].socketId) {
                            //         this.io.to(id).emit(config.socket.cancelCall);
                            //     }
                            // }
                            break;
                        case config.callProgress.wating:

                            if (index == arrId[0]) {
                                if (!global.callProgress[key].socketId.includes(this.socket.id)) {
                                    return;
                                }

                                for (let id of usersOnline[arrId[1]].socketId) {
                                    this.io.to(id).emit(config.socket.cancelCall);
                                }

                                startAt = global.callProgress[key].startAt;
                                typeCall = global.callProgress[key].typeCall;
                                typeDoctor = global.callProgress[key].typeDoctor;
                                this.sendToLogService(arrId[0], arrId[1], 0, 1, 'abandoned', startAt, moment().format('YYYY-MM-DD HH:mm:ss'),typeCall,typeDoctor)
                                this.sendToLogService(arrId[1], arrId[0], 1, 0, 'missed', startAt, moment().format('YYYY-MM-DD HH:mm:ss'),typeCall,typeDoctor)
                            } else {
                                for (let id of usersOnline[arrId[1]].socketId) {
                                    this.io.to(id).emit(config.socket.hideModalReceiveCall);
                                }
                                for (let id of usersOnline[arrId[0]].socketId) {
                                    this.io.to(id).emit(config.socket.statusAnswer, {
                                        status: false
                                    });
                                }

                                startAt = global.callProgress[key].startAt;
                                typeCall = global.callProgress[key].typeCall;
                                typeDoctor = global.callProgress[key].typeDoctor;
                                this.sendToLogService(arrId[0], arrId[1], 0, 1, 'reject', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall,typeDoctor)
                                this.sendToLogService(arrId[1], arrId[0], 1, 0, 'busy', startAt, moment().format('YYYY-MM-DD HH:mm:ss'),typeCall,typeDoctor)

                            }

                            clearTimeout(global.objTimeOutCalling[arrId[0]])
                            delete global.objTimeOutCalling[arrId[0]];
                            break;
                        case config.callProgress.incall:
                            if (!global.callProgress[key].socketId.includes(this.socket.id)) {
                                return;
                            }

                            clearTimeout(global.objTimeOutOfRoom[arrId[0]])
                            delete global.objTimeOutOfRoom[arrId[0]];

                            if (index == arrId[0]) {
                                for (let id of usersOnline[arrId[1]].socketId) {
                                    this.io.to(id).emit(config.socket.endCall);
                                }
                            } else {
                                for (let id of usersOnline[arrId[0]].socketId) {
                                    this.io.to(id).emit(config.socket.endCall);
                                }
                            }

                            startAt = global.callProgress[key].startAt;
                            this.sendToLogService(arrId[0], arrId[1], 0, 1, 'success', startAt, moment().format('YYYY-MM-DD HH:mm:ss'))
                            this.sendToLogService(arrId[1], arrId[0], 1, 0, 'success', startAt, moment().format('YYYY-MM-DD HH:mm:ss'))
                            break;
                    }
                    let objUser = {};
                    objUser[arrId[0]] = {
                        status: config.userStatus.online
                    }
                    objUser[arrId[1]] = {
                        status: config.userStatus.online
                    }
                    if(usersOnline[arrId[0]]){
                        usersOnline[arrId[0]].status = config.userStatus.online;
                    }
                    if(usersOnline[arrId[1]]){
                        usersOnline[arrId[1]].status = config.userStatus.online;
                    }

                    delete global.callProgress[key];
                    this.io.emit(config.socket.usersOnline, objUser);
                    break;
                }
            }
        }
        // await redisService.set(config.redis.usersOnline, usersOnline);

    }


}

module.exports = disconnect;