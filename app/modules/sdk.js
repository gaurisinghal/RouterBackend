"use strict";

const NodeSDK = require("rainbow-node-sdk");
const logger = require('./logger');

const push = require("./database_mod");

const LOG_ID = "STARTER/SDKN - ";

class SDK {
    
    constructor() {
        logger.log("debug", LOG_ID + "constructor()");
        this.nodeSDK = null;
    }

    start(bot, argv) {
        return new Promise((resolve) => {

            if(argv.length >= 4) {
                bot.credentials.login = argv[2];
                bot.credentials.password = argv[3];
                logger.log("info", LOG_ID + "using " + bot.credentials.login  + " (forced by CLI)");
            }

             // Start the SDK
            this.nodeSDK = new NodeSDK(bot);

            this.nodeSDK.events.on('rainbow_onmessagereceived', (message) => {
                // send manually a 'read' receipt to the sender
                this.nodeSDK.im.markMessageAsRead(message);

                // send an answer
                if(message.type === "chat") {
                    this.nodeSDK.im.sendMessageToJid("received", message.fromJid);
                    //logger.log("info", "message info " + message.content);
                    push.todb(message.content);
                     logger.log("info","message.fromJID  "+message.fromJid);
                    if(message.content=="create bubble"){
                        /*
                        let bubble_jid = '';
                        this.nodeSDK.bubbles.createBubble("My Bubble Name", "My bubble description",false).then(function(bubble){
                            bubble_jid = bubble.jid;
                            logger.log("info", "bubble created");
                            logger.log("info","message.fromJID inside bubble function "+message.fromJid);
                        });
                        */
                        this.nodeSDK.im.sendMessageToJid("creating bubble", message.fromJid);
                        let contact_id = this.nodeSDK.contacts.getContactByJid(message.fromJid);
                        //this.nodeSDK.bubbles.inviteContactToBubble(contact_id, this.nodeSDK.bubbles.getBubbleByJid(bubble_jid),false,false,"connect to agent");
                        let contact_agent = this.nodeSDK.contacts.getContactById("5e60e5ddd8084c29e64eba90", true);
                        this.nodeSDK.conversations.openConversationForContact(contact_agent);
                        //this.nodeSDK.bubbles.inviteContactToBubble(contact_agent,this.nodeSDK.bubbles.getBubbleByJid(bubble_jid),false,false,"connect to agent");
                        logger.log("info", "new bubble created and added users DONE");
                    }
                    
                } else if (message.type === "groupchat") {
                    this.nodeSDK.im.sendMessageToBubbleJid("ok", message.fromBubbleJid);
                }
            });

            this.nodeSDK.start().then(() => {
                logger.log("debug", LOG_ID + "SDK started");
                resolve();
            });
        });
    }

    restart() {
        return new Promise((resolve, reject) => {
            this.nodeSDK.events.once('rainbow_onstopped', (data) => {
                logger.log("debug", LOG_ID + "SDK - rainbow_onstopped - rainbow event received. data", data);

                logger.log("debug",  LOG_ID + "SDK - rainbow_onstopped rainbow SDK will re start");
                this.nodeSDK.start().then(() => {
                    resolve();
                });
            });

            this.nodeSDK.stop();
            /*this.nodeSDK.stop().then(() => {
                logger.log("debug", LOG_ID + "SDK stopped");
                return this.nodeSDK.start();
            }).then(() => {
                logger.log("debug", LOG_ID + "SDK started");
                resolve();
            }).catch((err) => {
                reject(err);
            }); // */
        });
    }

    get state() {
        return this.nodeSDK.state;
    }

    get version() {
        return this.nodeSDK.version;
    }

    get sdk() {
        return this.nodeSDK;
    }
}

module.exports = new SDK();
