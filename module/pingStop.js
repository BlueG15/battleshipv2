"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
async function testPongStop(input, roomdb, eventdb) {
    var _a;
    eventdb.emergencyBreak();
    return new universalModuleRes_1.moduleRes(undefined, "pongStopped", undefined, undefined, {
        "triggered-user": (_a = input.cause) === null || _a === void 0 ? void 0 : _a.playerID,
        "event": input.event,
        "pong": false,
        "repeated-pong": false,
        "activation-time": eventdb.currentTime,
        "sendType": "sendToCauseIgnoreCheck"
    });
}
exports.default = testPongStop;
