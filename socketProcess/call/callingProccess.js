const config = require('./config');
const appConfig = require('../../config/app.json');
const redisService = require('../../libs/services/redisService');
const mCalendarService = require('../../libs/services/calendarService')
const sendToQueue = require('../../libs/RBMQ/sendToQueue');
const moment = require('moment');
const lodash = require('lodash');

class callingProcces {
    constructor(socket, io) {
        this.io = io;
        this.socket = socket;
        // gui thong bao cuoc goi den nguoi nhan
        socket.on(config.socket.connecting, async (data, setUserIdB) => {
            // data: userIdA,userNameA,userIdB,userNameB,typeCall ,isCallDuty,isPatient,consultationId
            try {
                let calendarService = new mCalendarService();
                let typeCall = data.typeCall;
                let typeDoctor = data.isCallDuty ? 'duty' : 'treatment';
                if (data.isCallDuty) {
                    let doctorSchedule = await calendarService.getDoctorSchedule('video');

                    if(lodash.isEmpty(doctorSchedule.data)){
                        socket.emit(config.socket.connected, false);
                        return;
                    }

                    data.userIdB = doctorSchedule.data.userId;
                    setUserIdB(doctorSchedule.data.userId);
                } else {
                    let checkCameConsultation;
                    if (data.isPatient) {
                        checkCameConsultation = await calendarService.checkConsultation(data.userIdA, data.userIdB);
                    } else {
                        checkCameConsultation = await calendarService.checkConsultation(data.userIdB, data.userIdA);
                    }

                    // neu den lich tu van
                    if (!checkCameConsultation.data.status) {
                        socket.emit(config.socket.connected, false);
                        return;
                    }
                }
                let usersOnline = await redisService.get(appConfig.redis.usersOnline);
                if (usersOnline[data.userIdB]) {

                    if (usersOnline[data.userIdB].status != config.userStatus.online || usersOnline[data.userIdA].status != config.userStatus.online) {
                        socket.emit(config.socket.connected, false);
                        // A busy B missed
                        this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'busy', moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                        this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'missed', moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                        return;
                    }
                }

                global.callProgress[data.userIdA + ',' + data.userIdB] = {
                    status: config.callProgress.connecting,
                    socketId: [this.socket.id],
                    startAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    typeCall,
                    typeDoctor
                };

                this.changeStatusUsersOnline(config.userStatus.busy, config.userStatus.busy, data);
                // gửi thông báo cuộc gọi đến notification service 
                let notificationService = appConfig.amqp.channel.notificationService;
                let dataEmit = {
                    method: notificationService.method.callToPer,
                    data: {
                        type: notificationService.method.callToPer,
                        userA: {
                            userIdA: data.userIdA,
                            socketIdA: this.socket.id,
                            userNameA: data.userNameA,
                        },
                        userB: {
                            userIdB: data.userIdB,
                            userNameB: data.userNameB,
                        },
                        consultationId: data.consultationId,
                        time: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                        typeCall: data.typeCall,
                        isCallDuty: data.isCallDuty
                    }
                }

                sendToQueue(dataEmit, notificationService.type, notificationService.type)

                let timeout = setTimeout(() => {
                    socket.emit(config.socket.connected, false);
                    this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, data);
                    //A error B none
                    let startAt = global.callProgress[data.userIdA + ',' + data.userIdB].startAt;
                    this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'error', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                    this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'none', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                }, 10 * 1000);
                global.objTimeConnecting[data.userIdA] = timeout;

            } catch (error) {
                socket.emit(config.socket.connected, false);
            }

        });

        // nguoi nhan gui thong bao da ket noi
        socket.on(config.socket.connected, async (data) => {
            // data : userIdA, userIdB, socketIdA
            if (global.objTimeConnecting[data.userIdA]) {
                let typeCall = global.callProgress[data.userIdA + ',' + data.userIdB].typeCall;
                let typeDoctor = global.callProgress[data.userIdA + ',' + data.userIdB].typeDoctor;
                global.callProgress[data.userIdA + ',' + data.userIdB] = {
                    status: config.callProgress.wating,
                    socketId: [data.socketIdA],
                    startAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    typeCall,
                    typeDoctor
                };

                clearTimeout(global.objTimeConnecting[data.userIdA]);
                delete global.objTimeConnecting[data.userIdA];

                io.to(data.socketIdA).emit(config.socket.connected, true);

                let timeout = setTimeout(async () => {
                    this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, data);
                    let usersOnline = await redisService.get(appConfig.redis.usersOnline);
                    for (let id of usersOnline[data.userIdB].socketId) {
                        io.to(id).emit(config.socket.timeOutCalling);
                    }
                    io.to(data.socketIdA).emit(config.socket.timeOutCalling, { caller: true });

                    // A noAnswer B missed
                    let startAt = global.callProgress[data.userIdA + ',' + data.userIdB].startAt;
                    this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'noAnswer', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                    this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'missed', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                }, 60 * 1000);

                global.objTimeOutCalling[data.userIdA] = timeout;
            }
        });

        // huy cuoc goi
        socket.on(config.socket.cancelCall, async (data) => {
            //data : userIdA, userIdB
            let typeCall = global.callProgress[data.userIdA + ',' + data.userIdB].typeCall;
            let typeDoctor = global.callProgress[data.userIdA + ',' + data.userIdB].typeDoctor;
            let startAt;
            if (global.objTimeConnecting[data.userIdA]) {
                let notificationService = appConfig.amqp.channel.notificationService;
                let dataEmit = {
                    method: notificationService.method.callToPer,
                    data: {
                        type: notificationService.method.callToPer,
                        endCall: true,
                        userB: {
                            userIdB: data.userIdB,
                        }

                    }
                }
                sendToQueue(dataEmit, notificationService.type, notificationService.type)

                clearTimeout(global.objTimeConnecting[data.userIdA]);
                delete global.objTimeConnecting[data.userIdA];

                startAt = moment().format('YYYY-MM-DD HH:mm:ss');
            } else {
                startAt = global.callProgress[data.userIdA + ',' + data.userIdB].startAt;
                delete global.callProgress[data.userIdA + ',' + data.userIdB];

                clearTimeout(global.objTimeOutCalling[data.userIdA]);
                delete global.objTimeOutCalling[data.userIdA];
            }

            this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, data);
            let usersOnline = await redisService.get(appConfig.redis.usersOnline);
            if (usersOnline[data.userIdB]) {
                for (let id of usersOnline[data.userIdB].socketId) {
                    io.to(id).emit(config.socket.cancelCall);
                }
            }
            // A abandoned B missed
            this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'abandoned', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
            this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'missed', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)

        });

        // nguoi nhan gui thao tac cuoc goi
        socket.on(config.socket.statusAnswer, async (data) => {
            //data: {statusAnswer,userIdA,socketIdA,userIB, isCallDuty, consultationId}
            let usersOnline = await redisService.get(appConfig.redis.usersOnline);
            clearTimeout(global.objTimeOutCalling[data.userIdA]);
            delete global.objTimeOutCalling[data.userIdA];
            let typeCall = global.callProgress[data.userIdA + ',' + data.userIdB].typeCall;
            let typeDoctor = global.callProgress[data.userIdA + ',' + data.userIdB].typeDoctor;
            if (data.statusAnswer) {
                // A success B success
                
                global.callProgress[data.userIdA + ',' + data.userIdB] = {
                    status: config.callProgress.incall,
                    socketId: [data.socketIdA, this.socket.id],
                    startAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    typeCall,
                    typeDoctor
                };
                this.changeStatusUsersOnline(config.userStatus.incall, config.userStatus.incall, data);
                let timeOutOfRoom;
                if(data.isCallDuty){
                    timeOutOfRoom = 600;
                }else{
                    let calendarService = new mCalendarService();
                    let consultationDetail = await calendarService.getConsultationDetail(data.consultationId);
                    let duration = moment.duration(moment(consultationDetail.data.endAt).diff(moment()));
                    timeOutOfRoom = duration.asSeconds();
                }
                
                let timeout = setTimeout(async () => {

                    for (let id of usersOnline[data.userIdB].socketId) {
                        io.to(id).emit(config.socket.outOfRoom);
                    }
                    io.to(data.socketIdA).emit(config.socket.outOfRoom);
                    delete global.objTimeOutOfRoom[data.userIdA];
                    delete global.objTimeOutOfRoom[data.userIdB];

                    this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, data);
                }, timeOutOfRoom * 1000);

                global.objTimeOutOfRoom[data.userIdA] = timeout;
                global.objTimeOutOfRoom[data.userIdB] = timeout;
            } else {
                this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, data);
                // A reject B busy
                let startAt = global.callProgress[data.userIdA + ',' + data.userIdB].startAt;
                this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'reject', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
                this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'busy', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)

                delete global.callProgress[data.userIdA + ',' + data.userIdB];
            }

            for (let id of usersOnline[data.userIdB].socketId) {
                io.to(id).emit(config.socket.hideModalReceiveCall);
            }
            io.to(data.socketIdA).emit(config.socket.statusAnswer, {
                status: data.statusAnswer,
                userIdB: data.userIdB,
                roomName: 'VMR_' + data.userIdB
            });
        });

        // ket thuc cuoc goi
        socket.on(config.socket.endCall, async (data) => {
            // data : {userIdA, userIdB,myUserId, partnerId}
            let typeCall = global.callProgress[data.userIdA + ',' + data.userIdB].typeCall;
            let typeDoctor = global.callProgress[data.userIdA + ',' + data.userIdB].typeDoctor;
            let startAt = global.callProgress[data.userIdA + ',' + data.userIdB].startAt;
            delete global.callProgress[data.userIdA + ',' + data.userIdB];
            if (global.objTimeOutOfRoom[data.myUserId] || objTimeOutOfRoom[data.partnerId]) {
                clearTimeout(global.objTimeOutOfRoom[data.myUserId]);
                delete global.objTimeOutOfRoom[data.partnerId];
                clearTimeout(global.objTimeOutOfRoom[data.partnerId]);
                delete global.objTimeOutOfRoom[data.myUserId];
            }

            let usersOnline = await redisService.get(appConfig.redis.usersOnline);
            for (let id of usersOnline[data.partnerId].socketId) {
                io.to(id).emit(config.socket.endCall);
            }

            await this.changeStatusUsersOnline(config.userStatus.online, config.userStatus.online, {
                userIdA: data.userIdA,
                userIdB: data.userIdB
            });
            // A success B success
            this.sendToLogService(data.userIdA, data.userIdB, 0, 1, 'success', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
            this.sendToLogService(data.userIdB, data.userIdA, 1, 0, 'success', startAt, moment().format('YYYY-MM-DD HH:mm:ss'), typeCall, typeDoctor)
        })

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

    async changeStatusUsersOnline(statusA, statusB, data) {
        try {
            let objUser = {};
            let usersOnline = await redisService.get(appConfig.redis.usersOnline);
            if (usersOnline[data.userIdB])
                usersOnline[data.userIdB].status = statusB;
            if (usersOnline[data.userIdA])
                usersOnline[data.userIdA].status = statusA;
            await redisService.set(appConfig.redis.usersOnline, usersOnline);

            objUser[data.userIdA] = {
                status: statusA
            };
            objUser[data.userIdB] = {
                status: statusB
            };
            this.io.emit(config.socket.usersOnline, objUser);
        } catch (error) {

        }

    }

}

module.exports = callingProcces;