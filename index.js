const Koa = require("koa");
const app = new Koa();
const redisAdapter  = require('socket.io-redis');

const appConfig = require('./config/app.json');
const apiRoute = require('./routes/api');
const bodyParse = require('koa-bodyparser');


const server = require('http').createServer(app.callback());
const io = require('socket.io').listen(server)
io.adapter(redisAdapter({ host: appConfig.redis.host, port: appConfig.redis.port }));
const redisService = require('./libs/services/redisService');

const messageProcess = require('./socketProcess/message/messageProcess');
const roomProcess = require('./socketProcess/message/roomProcess');
const message = io.of('/message');

const userOnlineProcces = require('./socketProcess/call/userOnlineProcces');
const callingProccess = require('./socketProcess/call/callingProccess');
const call = io.of('/call');


message.on('connection', (socket) => {
    console.log("connected")
    try {
	    new messageProcess(socket, message);
	    new roomProcess(socket, message);
    } catch (error) {
        console.log(error);
    }
    
});

global.objTimeOutOfRoom = {};
global.callProgress = {};
global.objTimeConnecting = {};
global.objTimeOutCalling = {};
global.arrSocketNative = [];

call.on('connection', (socket) => {
    try {
	    new userOnlineProcces(socket, call);
        new callingProccess(socket, call);
    } catch (error) {
        console.log(error);
    }
})

global.basePath = __dirname;
global.messageSocket = message;

if (appConfig.showLog) {
    const logger = require('koa-logger');
    app.use(logger());
}

app.use(bodyParse());
app.use(apiRoute.routes()).use(apiRoute.allowedMethods());

const handleClose = async () => {
	await redisService.delete(appConfig.redis.usersOnline);
	process.exit(0);
}
process.on('exit', handleClose);

process.on('SIGINT', handleClose);


server.listen(appConfig.port, '0.0.0.0', () => {
    console.log('listen port ' + appConfig.port);
});
