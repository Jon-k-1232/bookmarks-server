const winston = require('winston');
const {NODE_ENV} = require('./config');


const log = winston.createLogger({
level: "info",
format: winston.format.json(),
transports: [
    new winston.transports.File({ filename: "info.log"})
    ]
});


if(!['production', 'test'].includes(NODE_ENV)){
    log.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}


module.exports = log;



