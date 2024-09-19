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
    let k = (0, genericModInputVerifier_1.default)(input, true, false, false);
    if (k.fail) {
        k.fixAndAppendData("joinRoom", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    let arr = ["name", "roomID"];
    let arr2 = ["string", "string"];
    for (let index = 0; index < arr.length; index++) {
        let i = arr[index];
        if (!input.data || !input.data[i] || (typeof input.data[i]) != arr2[index]) {
            let res = new response_1.response(true, "joinRoom", "unknown", `no ${i} in input data or wrong type`, { input: input });
            return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, res);
        }
    }
    if (!input.cause || !input.cause.playerID || !input.data || !input.data.name || !input.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN JOINROOM");
    let player = new gameObjects_1.playerObj(input.cause.playerID, input.data.name);
    let final = await roomdb.insertPlayer2(input.data.roomID, player);
    if (final.fail) {
        final.fixAndAppendData("joinRoom", ``, input.data.name);
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, final);
    }
    if (!final.data.roomID)
        throw new Error("CRITICAL SERVER FAILURE IN JOINROOM");
    let final2 = new response_1.response(false, final.event, final.player, final.note, JSON.parse(JSON.stringify(final.data)));
    if (final2.data.p1Obj && final2.data.p1Obj.shipObjArray)
        final2.data.p1Obj.shipObjArray = [];
    //welp i forgor to inform everyone when player leaves lol
    return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, final2, undefined, undefined, final, final);
}
exports.default = joinRoom;
