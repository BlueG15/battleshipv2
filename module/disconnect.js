"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleRes_1 = require("../utils/classes/universalModuleRes");
async function disconnect(input, roomdb, eventdb) {
    let res = new universalModuleRes_1.moduleRes();
    if (!input.cause || !input.cause.playerID) {
        return res;
    }
    ;
    eventdb.removeAllEventsAddedByAPlayer(input.cause.playerID);
    let playerData = await roomdb.getRoomOfUserFromID(input.cause.playerID);
    if (!playerData || !playerData.roomID)
        return res;
    let x = await roomdb.removeFromRoom(playerData.roomID, input.cause.playerID);
    //let res = new moduleRes(`socket ${input.cause.playerID} disconnected`, undefined, undefined, undefined, undefined, x);
    res = new universalModuleRes_1.moduleRes(`socket ${input.cause.playerID} disconnected`, undefined, undefined, undefined, undefined, x);
    return res;
}
exports.default = disconnect;
