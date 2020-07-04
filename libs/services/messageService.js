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

    inviteRoom(email, roomId){
        let postData = {
            email: email,
            roomId: roomId
        }
        return axios.post(this.url + '/user/invite', postData, {headers: this.header})
    }

    addRoom(email, roomId){
        let postData = {
            email: email,
            roomId: roomId,
            type: true
        }
        return axios.post(this.url + '/user/addRoomBasic', postData, {headers: this.header})
    }
   
    checkInvite(email, roomId){
        return axios.get(this.url + '/checkInvite/' + email + '/' + roomId, {headers: this.header})
    }
   
}

module.exports = messageService;