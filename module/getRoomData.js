"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
async function getRoomData(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, false, true, false);
    if (k.fail) {
        k.fixAndAppendData("getRoomData", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    if (!input.cause || !input.cause.playerID || !input.cause.roomID || !input.cause.name)
        throw new Error("CRITICAL SERVER FAILURE IN getRoomData");
    let game = await roomdb.getRoomData(input.cause.roomID);
    if (!game) {
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, "getRoomData", input.cause.name, `unable to fetch game data`, { playerData: input.cause }));
    }
    return new universalModuleRes_1.moduleRes(new response_1.response(false, "getRoomData", input.cause.name, `successfully got roomData`, { roomData: game.sanitizeSelf() }));
}
exports.default = getRoomData;
