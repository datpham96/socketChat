const redis = require('redis');
const appConfig = require('../../config/app.json');
const client = redis.createClient(appConfig.redis.port, appConfig.redis.host);

let redisService = {
    get: (key) => {

        return new Promise((resolve, reject) => {
            client.get(key, (err, replies) => {
                if(err){
                    reject(err);
                }
                resolve(JSON.parse(replies));
            });
        });
    },
    set: (key, data) => {

        return new Promise((resolve, reject) => {
            client.set(key, JSON.stringify(data), (err, replies) => {
                if(err){
                    reject(err);
                }
                resolve(replies);
            });
        });
    },
    delete: (key) => {
        return new Promise((resolve, reject) => {
            client.del(key, (err, replies) => {
                if(err){
                    reject(err);
                }
                resolve(replies);
            });
        });
    },
    deleteAll: () => {
        return new Promise((resolve, reject) => {
            client.flushdb((err, replies) => {
                if(err){
                    reject(err);
                }
                resolve(replies);
            });
        });
    }
};

module.exports = redisService;