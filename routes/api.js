const Router = require("koa-router");
const messageCtrl = require('../controllers/messageCtrl');
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
apiRouter.post('/addRom', async ctx => { await new messageCtrl(ctx).addRom() });

//outRoom
apiRouter.post('/outRoom', async ctx => { await new messageCtrl(ctx).outRoom() });

module.exports = apiRouter;