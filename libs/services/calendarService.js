const axios = require('axios');
const config = require('../../config/app.json');
const querystring = require('querystring');


class calendarService {
    constructor(){
        this.url = config.calendarService.url;
        let user = config.calendarService.user;
        let pass = config.calendarService.pass;
        this.header = {
            'Authorization': 'Basic ' + Buffer.from(user + ":" + pass).toString('base64'),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    }

    checkConsultation(patientId, doctorId){
        return axios.post(this.url + '/consultation/check/' + patientId + '/' + doctorId, {} , {headers: this.header})
    }
    getDoctorSchedule(type){
        return axios.get(this.url + '/dutySchedule/roundRobin/' + type, {headers: this.header});
    }
    getConsultationDetail(consultationId){
        return axios.get(this.url + '/consultationBasicAuth/' + consultationId, {headers: this.header})
    }
}

module.exports = calendarService;