const authServer = require('../../libs/services/authService');
const messageFunc = require('./myFunc');
class login {
    constructor(socket){
        this.socket = socket
    }

    async main(accessToken){
        try {
            let mAuthServer = new authServer(accessToken);
            let responseData = await mAuthServer.getUserInfo();
            
            if(responseData.data.email){
                this.socket.join(messageFunc.buildRoomName(responseData.data.email));
            }
        } catch (error) {
            this.socket.disconnect(true);
        }
        
    }
}
module.exports = login;
