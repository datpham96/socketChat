const login = require('./login');
const eventConfig = require('./config');

class messageProcess {

    constructor(socket, request) {
        let loginProcess = new login(socket);
        socket.on(eventConfig.onEvent.login, async function (data) {
            await loginProcess.main(data.accessToken);
        });
    }
}

module.exports = messageProcess;