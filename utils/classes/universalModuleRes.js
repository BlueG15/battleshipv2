"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleRes = void 0;
const universalServerLog_1 = require("./universalServerLog");
class moduleRes {
    constructor(param1, param2, 
    //player relative sends
    sendToCause, sendToOther, sendToCauseIgnoreCheck, 
    //room relative sends
    sendToAll, sendToPlayers, sendToSpectators, sendToP1, sendToP2, sendToP3, sendToP4) {
        if (arguments.length < 1) {
            return;
        }
        ;
        if (arguments.length == 1) {
            if (param1 instanceof universalServerLog_1.serverLogData) {
                this.serverLog = param1;
                this.sendToCause = param2;
                return;
            }
            else {
                this.eventOveride = param1;
                this.sendToCause = param2;
                return;
            }
        }
        this.serverLog = param1;
        this.eventOveride = (typeof param2 == "string") ? param2 : undefined;
        //player relative sends
        this.sendToCause = sendToCause;
        this.sendToOther = sendToOther;
        this.sendToCauseIgnoreCheck = sendToCauseIgnoreCheck;
        //room relative sends
        this.sendToAll = sendToAll;
        this.sendToPlayers = sendToPlayers;
        this.sendToSpectators = sendToSpectators;
        this.sendToP1 = sendToP1;
        this.sendToP2 = sendToP2;
        this.sendToP3 = sendToP3;
        this.sendToP4 = sendToP4;
    }
}
exports.moduleRes = moduleRes;
