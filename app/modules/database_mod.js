const logger = require('./logger');

class Push{
    constructor(){
        logger.log("info","Push class made");    
        
    }

    todb(message){
        if(message =="hardware"){
            logger.log("info",message+" pushed to database - hardware \n");    
        }
        else if(message == "software"){
            logger.log("info",message+" pushed to database - software \n");    

        }
        else{
            logger.log("info",message+" pushed to database - others\n"); 
        }   
    }
}

module.exports = new Push();