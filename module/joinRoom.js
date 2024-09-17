"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
const gameObjects_1 = require("../utils/classes/gameObjects");
async function joinRoom(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, true, false);
    if (k.fail) {
        k.fixAndAppendData("joinRoom", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(k);
    }
    let arr = ["name", "roomID"];
    let arr2 = ["string", "string"];
    arr.forEach((i, index) => {
        if (!input.data || !input.data[i] || (typeof input.data[i]) != arr2[index]) {
            let res = new response_1.response(true, "uploadShipData", "unknown", `no ${i} in input data or wrong type`, { input: input });
            return new universalModuleRes_1.moduleRes(res);
        }
    });
    if (!input.cause || !input.cause.playerID || !input.data || !input.data.name || !input.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN JOINROOM");
    let player = new gameObjects_1.playerObj(input.cause.playerID, input.data.name);
    let final = await roomdb.insertPlayer2(input.data.roomID, player);
    if (final.fail) {
        final.fixAndAppendData("joinRoom", ``, input.data.name);
        return new universalModuleRes_1.moduleRes(final);
    }
    if (!final.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN JOINROOM");
    return new universalModuleRes_1.moduleRes(final);
}
exports.default = joinRoom;
