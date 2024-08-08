"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventControl_1 = require("../eventSystem/eventControl");
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
async function testPong(input) {
    var _a, _b;
    if (!input.data) {
        input.data = { count: 0 };
    }
    else if (!input.data.count && input.data.count != 0) {
        input.data.count = 0;
    }
    else {
        input.data.count++;
    }
    let ev = new eventControl_1.e((_a = input.cause) === null || _a === void 0 ? void 0 : _a.playerID, "ping", eventControl_1.eControl.currentTime + 5 * eventControl_1.eControl.timePerFrame, input);
    eventControl_1.eControl.addEvent(ev);
    return new universalModuleRes_1.response_x(undefined, "pong", undefined, undefined, {
        "triggered-user": (_b = input.cause) === null || _b === void 0 ? void 0 : _b.playerID,
        "event": input.event,
        "pong": true,
        "repeated-pong": true,
        "pong-count": input.data.count,
        "activation-time": eventControl_1.eControl.currentTime,
        "sendType": "sendToCauseIgnoreCheck",
        "fullInput": input
    });
}
exports.default = testPong;
