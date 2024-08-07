"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response_x = void 0;
class response_x {
    constructor(serverLog, eventOveride, 
    //player relative sends
    sendToCause, sendToOther, sendToCauseIgnoreCheck, 
    //room relative sends
    sendToAll, sendToPlayers, sendToSpectators, sendToP1, sendToP2, sendToP3, sendToP4) {
        this.serverLog = ""; //if not empty, logs
        this.serverLog = serverLog;
        this.eventOveride = eventOveride;
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
exports.response_x = response_x;
