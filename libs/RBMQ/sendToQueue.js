const amqplib = require('amqplib/callback_api');
const config = require('../../config/app.json');
const errCode = require('../../config/errCode.json');

module.exports = async (data, channelAMQP, queue) => {
    try {
        await new Promise((resolve, reject) => {
            amqplib.connect(config.amqp.uri + '/' + channelAMQP, (err, connection) => {
                if (err) {
                    console.log(err)
                    reject(errCode.amqp.connectService);
                }

                // Create channel
                connection.createChannel((err, channel) => {
                    if (err) {
                        reject(errCode.amqp.createChannel);
                    }

                    // Ensure queue for messages
                    channel.assertQueue(queue, {
                        // Ensure that the queue is not deleted when server restarts
                        durable: true
                    }, err => {
                        if (err) {
                            reject(errCode.amqp.assertQueue);
                        }

                        // Create a function to send objects to the queue
                        // Javascript opbject is converted to JSON and the into a Buffer
                        let sender = (content) => {
                            let sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {
                                // Store queued elements on disk
                                persistent: true,
                                contentType: 'application/json'
                            });
                            if (sent) {
                                channel.close(() => connection.close());
                            } else {
                                channel.once('drain', sender(content));
                            }
                        };

                        sender(data);

                        resolve();
                    });
                });
            });
        });

        return {
            status: true,
            errCode: null
        };
    } catch (error) {
        console.log(error);
        return {
            status: false,
            errCode: error
        };
    }

}