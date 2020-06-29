const axios = require('axios');
const config = require('../../config/app.json');

class messageService {
    constructor(){
        this.url = config.messageService.url;
        let user = config.messageService.user;
        let pass = config.messageService.pass;
        this.header = {
            'Authorization': 'Basic ' + Buffer.from(user + ":" + pass).toString('base64'),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    }

    listRoomByEmail(email){
        return axios.get(this.url + '/user/roomBasic/' + email, {headers: this.header})
    }
   
}

module.exports = messageService;