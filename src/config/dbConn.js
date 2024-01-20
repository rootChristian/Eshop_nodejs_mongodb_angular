/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

require("dotenv/config");
const mongoose = require('mongoose');
const { logEvents } = require('../middleware/logger');

const mongo_user = process.env.MONGO_USER;
const mongo_password = process.env.MONGO_PASSWORD;
const mongo_ip = process.env.MONGO_IP;
const mongo_database = process.env.MONGO_DATABASE;

const mongodbURL = `mongodb+srv://${mongo_user}:${mongo_password}@${mongo_ip}/${mongo_database}?retryWrites=true&w=majority`;

const connectWithRetry = () => {
    mongoose.connect(mongodbURL)
        .then(() => {
            console.log(`The connection to ${mongo_database} is ready...`);
        })
        .catch((err) => {
            console.log('Connection database is failled...\n'/*, err, '\n\n'*/);
            logEvents(`${err}\t${err.codeName} ${err.code}\t`, 'mongoErrLog.log')
            setTimeout(connectWithRetry, 5000)
        })
}

module.exports = connectWithRetry

