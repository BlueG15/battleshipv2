"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
const response_1 = require("../utils/classes/response");
const genericModInputVerifier_1 = __importDefault(require("../utils/func/genericModInputVerifier"));
async function chat(input, roomdb, eventdb) {
    let k = (0, genericModInputVerifier_1.default)(input, true, true, false);
    if (k.fail || !input.data || !input.data.message) {
        k.fixAndAppendData("chat", `failed to validate input`, "unknown");
        return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
    }
    if (!input.cause || !input.cause.playerID || !input.data)
        throw new Error("CRITICAL SERVER FAILURE IN chat");
    let str = "";
    switch (input.cause.player) {
        case 1:
        case 2: {
            if (!input.cause.name) {
                k.fixAndAppendData("chat", `failed to validate input`, "unknown");
                return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
            }
            str = input.cause.name;
            break;
        }
        case 3:
        case 4: {
            str = `spectator ${input.cause.player}`;
            break;
        }
        default: {
            k.fixAndAppendData("chat", `failed to validate input`, "unknown");
            return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, k);
        }
    }
    let res = new response_1.response(false, "chat", str, `player ${str} sent a chat messege}`, { player: str, playerNum: input.cause.player, message: input.data.message });
    return new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, undefined, res);
}
exports.default = chat;
