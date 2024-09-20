"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
async function updateGameMetaData(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, true, true, true);
    if (k.fail) {
        k.fixAndAppendData("createRoom", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    if (!input.cause || !input.cause.playerID || !input.cause.roomID || !input.cause.name || !input.data)
        throw new Error("CRITICAL SERVER FAILURE IN CREATEROOM");
    if (input.cause.player != 1 && input.cause.player != 2) {
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, "updateGameMetaData", input.cause.name, `non-player cannot trigger this event`, { playerData: input.cause }));
    }
    if ((input.data.timeBonus && typeof input.data.timeBonus != "number") || (input.data.timePerPlayer && typeof input.data.timePerPlayer != "number")) {
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, "updateGameMetaData", input.cause.name, `wrong input for modifying game meta data`, { input: input.data }));
    }
    let final = await roomdb.updateGameMetaData(input.cause.roomID, input.cause.name, input.data.timePerPlayer, input.data.timeBonus);
    return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, undefined, final);
}
exports.default = updateGameMetaData;
