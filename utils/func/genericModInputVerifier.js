"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../classes/response");
exports.default = (a, dataRequired = false, roomDataRequired = false, nameRequired = false) => {
    var _a, _b;
    if (!a.event)
        return new response_1.response(true, "unknown", "unknon", "wrong input - no event", { input: a });
    let event = a.event;
    if (!a.cause)
        return new response_1.response(true, event, "unknown", "wrong input - no cause", { input: a });
    if (!a.cause.playerID)
        return new response_1.response(true, event, "unknown", "wrong input - no playerID", { input: a });
    if (!a.cause.roomID && roomDataRequired)
        return new response_1.response(true, event, "unknown", "wrong input - no roomID", { input: a });
    if (!a.cause.roomData && roomDataRequired)
        return new response_1.response(true, event, "unknown", "wrong input - no roomData", { input: a });
    if (!a.cause.name && nameRequired)
        return new response_1.response(true, event, "unknown", "wrong input - no name", { input: a });
    if (!a.data && dataRequired)
        return new response_1.response(true, event, (_a = (a.cause.name)) !== null && _a !== void 0 ? _a : "unknown", "wrong input - no data", { input: a });
    return new response_1.response(false, a.event, (_b = a.cause.name) !== null && _b !== void 0 ? _b : "unknown", "valid input", { input: a });
};
