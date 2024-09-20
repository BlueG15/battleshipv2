"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
async function toggleReady(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, false, true, true);
    if (k.fail) {
        k.fixAndAppendData("createRoom", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    if (!input.cause || !input.cause.playerID || !input.cause.roomID || !input.cause.name)
        throw new Error("CRITICAL SERVER FAILURE IN CREATEROOM");
    if (input.cause.player != 1 && input.cause.player != 2) {
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, "toggleReady", input.cause.name, `non-player cannot toggle ready`, { playerData: input.cause }));
    }
    let final = await roomdb.togglePlayerReady(input.cause.roomID, input.cause.name, input.cause.player);
    let player = final.data[`p${input.cause.player}Obj`];
    if (!player) {
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, "toggleReady", input.cause.name, `player not exist in this room`, { playerData: input.cause }));
    }
    let res = new response_1.response(false, "toggleReady", input.cause.name, final.note, { player: input.cause.player, isReady: player.isReady });
    return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, undefined, res);
}
exports.default = toggleReady;
