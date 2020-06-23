const Router = require("koa-router");
const userCtrl = require('../controllers/userCtrl');
const mdwAddHeaderJson = require('../middleware/apiHeaderResponse');

let apiRouter = new Router({
    prefix: '/api/v1'
});

apiRouter.use(mdwAddHeaderJson);

apiRouter.get('/user', async ctx => { await new userCtrl(ctx).listUser() });
apiRouter.post('/user', async ctx => { await new userCtrl(ctx).insertUser() });
apiRouter.put('/user/:id', async ctx => { await new userCtrl(ctx).updateUser(ctx.params.id) });
apiRouter.delete('/user/:id', async ctx => { await new userCtrl(ctx).deleteUser(ctx.params.id) });

module.exports = apiRouter;