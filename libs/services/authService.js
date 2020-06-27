const axios = require("axios");
const config = require('../../config/app.json');

class authService {
    constructor(tokenKey){
        this.header = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + tokenKey
        }
    }

    getUserInfo(){
        return axios.get(config.authServer.url + '/userInfo', {
            headers: this.header
        });
    }
}

module.exports = authService;