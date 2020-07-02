const Router = require("koa-router");
const messageCtrl = require('../controllers/messageCtrl');
const roomCtrl = require('../controllers/roomCtrl');
const mdwAddHeaderJson = require('../middleware/apiHeaderResponse');
const config = require('../config/app.json');
const koaBasicAuth = require('koa-basic-auth');

let apiRouter = new Router({
    prefix: '/api/v1'
});

let apiRouter = new Router({
    prefix: '/api/v1'
});

apiRouter.use(mdwAddHeaderJson);
apiRouter.use(koaBasicAuth(config.auth));

//sendMessage
apiRouter.post('/sendMessage', async ctx => { await new messageCtrl(ctx).index() });

//addRoom
apiRouter.post('/addRom', async ctx => { await new roomCtrl(ctx).addRom() });

//outRoom
apiRouter.post('/outRoom', async ctx => { await new roomCtrl(ctx).outRoom() });

//outRoom
apiRouter.post('/invite', async ctx => { await new roomCtrl(ctx).invite() });

module.exports = apiRouter;