"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
const gameObjects_1 = require("../utils/classes/gameObjects");
const playerInput_shipDataUpload_1 = require("../utils/classes/playerInput_shipDataUpload");
async function uploadShipData(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, true, true);
    let playerName = (input.cause && input.cause.name) ? input.cause.name : "unknown";
    if (k.fail) {
        k.fixAndAppendData("uploadShipData", "failed to validate input", playerName);
        return new universalModuleRes_1.moduleRes(k);
    }
    let arr = ["roomID", "playerID", "shipData"];
    let arr2 = ["string", "string", "object"];
    arr.forEach((i, index) => {
        if (!input.data || !input.data[i] || (typeof input.data[i]) != arr2[index]) {
            let res = new response_1.response(true, "uploadShipData", playerName, `no ${i} in input data or wrong type`, { input: input });
            return new universalModuleRes_1.moduleRes(res);
        }
    });
    //recheck cause ts
    if (!input.cause || !input.cause.roomID || !input.cause.playerID || !input.data || !input.data.playerID || !input.data.roomID || !input.data.shipData)
        throw new Error("CRITICAL SERVER FAILURE IN UPLOADSHIPDATA");
    let parsed = [];
    input.data.shipData.forEach((i, index) => {
        let temp = new playerInput_shipDataUpload_1.middleStepShipObj(i);
        let res = temp.convertToShipObj();
        if (res instanceof response_1.response) {
            res.event += " called in event uploadShipData";
            res.note += " error occured at index " + index + " in shipData arr";
            res.player = (input.cause && input.cause.name) ? input.cause.name : "unknown";
            return new universalModuleRes_1.moduleRes(undefined, undefined, res);
        }
        parsed.push(res);
    });
    if (input.cause.player != 1 && input.cause.player != 2) {
        let res = new response_1.response(true, "uploadShipData", playerName, `spectator cannot change gameData`, { player: input.cause.player });
        return new universalModuleRes_1.moduleRes(res);
    }
    let player = new gameObjects_1.playerObj(input.cause.playerID, playerName, undefined, undefined, undefined, parsed);
    let final = await roomdb.updatePlayerData(input.cause.roomID, input.cause.player, player);
    if (final.fail) {
        final.fixAndAppendData("uploadShipData", ``, playerName);
        return new universalModuleRes_1.moduleRes(final);
    }
    let res1 = new response_1.response(false, "uploadShipData", playerName, "successfully uploaded shipData", { player: input.cause.player });
    let res2 = new response_1.response(false, "uploadShipData", playerName, `player ${playerName} updated shipData`, { player: input.cause.player });
    return new universalModuleRes_1.moduleRes(undefined, undefined, res1, res2);
}
exports.default = uploadShipData;
