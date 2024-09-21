"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
async function joinAsSpectator(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, true, false, false);
    if (k.fail) {
        k.fixAndAppendData("joinAsSpectator", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    let arr = ["roomID"];
    let arr2 = ["string"];
    for (let index = 0; index < arr.length; index++) {
        let i = arr[index];
        if (!input.data || !input.data[i] || (typeof input.data[i]) != arr2[index]) {
            let res = new response_1.response(true, "joinAsSpectator", "unknown", `no ${i} in input data or wrong type`, { input: input });
            return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, res);
        }
    }
    if (!input.cause || !input.cause.playerID || !input.data || !input.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN joinAsSpectator");
    let final = await roomdb.insertSpectator(input.data.roomID, input.cause.playerID);
    if (final.fail) {
        final.fixAndAppendData("joinAsSpectator", ``, `spectator${final.data.spectatorCount}`);
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, final);
    }
    if (!final.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN joinAsSpectator");
    return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, undefined, final);
}
exports.default = joinAsSpectator;
