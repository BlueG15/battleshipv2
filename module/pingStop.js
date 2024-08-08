"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventControl_1 = require("../eventSystem/eventControl");
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
async function testPongStop(input = {}) {
    var _a;
    eventControl_1.eControl.emergencyBreak();
    return new universalModuleRes_1.response_x(undefined, "pongStopped", undefined, undefined, {
        "triggered-user": (_a = input.cause) === null || _a === void 0 ? void 0 : _a.playerID,
        "event": input.event,
        "pong": false,
        "repeated-pong": false,
        "activation-time": eventControl_1.eControl.currentTime,
        "sendType": "sendToCauseIgnoreCheck"
    });
}
exports.default = testPongStop;
