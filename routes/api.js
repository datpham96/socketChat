const Router = require("koa-router");
const messageCtrl = require('../controllers/messageCtrl');
const mdwAddHeaderJson = require('../middleware/apiHeaderResponse');
const config = require('../config/app.json');
const auth = require('koa-basic-auth');

let apiRouter = new Router({
    prefix: '/api/v1'
});

apiRouter.use(mdwAddHeaderJson);
apiRouter.use(auth(config.auth));

apiRouter.post('/sendMessage', async ctx => { await new messageCtrl(ctx).index() });

module.exports = apiRouter;