"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
async function testPong(input) {
    var _a;
    return new universalModuleRes_1.response_x(undefined, "pong", undefined, undefined, {
        "triggered-user": (_a = input.cause) === null || _a === void 0 ? void 0 : _a.playerID,
        "event": input.event,
        "pong": true,
        "repeated-pong": false,
        "sendType": "sendToCauseIgnoreCheck"
    });
}
exports.default = testPong;
