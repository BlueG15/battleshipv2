"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const response_1 = require("../utils/classes/response");
//import {default as gameController} from "./gameControl"
const utils_1 = __importDefault(require("../utils/func/utils"));
class roomController {
    constructor(db) {
        this.db = db;
    }
    async dropRoomTable() {
        await this.db.query(`
      DROP TABLE IF EXISTS rooms;
    `);
        return;
    }
    async init() {
        await this.db.query(`CREATE TABLE IF NOT EXISTS rooms (
          roomID VARCHAR(10) PRIMARY KEY,
          p1ID VARCHAR(20),
          p1Name VARCHAR(20),
          p1Ready BOOLEAN,
          p2ID VARCHAR(20),
          p2Name VARCHAR(20),
          p2Ready BOOLEAN,
          p3ID VARCHAR(20),
          p4ID VARCHAR(20)
      );`); //p3 and p4 are spectators
        return 0;
    }
    async getRoomData(roomID) {
        const res = await this.db.query(`SELECT * FROM rooms WHERE roomID = '${roomID}'`);
        if (!res || !res.length)
            return undefined;
        return res[0]; //object, empty if nothing found
    }
    async createRoomAndInsertP1(playerID, playerName) {
        const exist = await this.db.query(`SELECT roomID FROM rooms`);
        if (!exist)
            return new response_1.response(true, 'createRoom', playerID, 'somehow fail to execute query SELECT roomID FROM rooms, exist returns undefined');
        let len = 6;
        let roomID = utils_1.default.generateRandomID(len);
        let count = 0;
        while (exist.includes(roomID) && count < 300) {
            roomID = utils_1.default.generateRandomID(len);
            count++;
        }
        if (exist.includes(roomID)) {
            //fail to create room, data base full
            return new response_1.response(true, "createRoom", playerID, `Fail to create a new room, database full, considering restarting it, rooms should NOT last this long`, { "exist": exist });
        }
        await this.db.query(`                                
      INSERT INTO rooms (roomID, p1ID, p1Name, p1Ready) VALUES ('${roomID}', '${playerID}', '${this.db.sanitizeString(playerName)}', false);
    `);
        const res = {
            'roomID': roomID,
            'host': true
        };
        //note to self: socket.send to playerID what this resolves
        return new response_1.response(false, 'createRoom', playerID, `player ${playerID} successfully created new room with roomID = ${roomID}`, res);
    }
    async addP2ToRoom(playerID, playerName, roomID) {
        //only adds the 2nd player as the 1st is added on room creation
        const roomData = await this.getRoomData(roomID);
        if (!roomData)
            return new response_1.response(true, 'addToRoom', playerID, 'room not exist');
        if (roomData['p2id'])
            return new response_1.response(true, 'addToRoom', playerID, 'room full');
        await this.db.transac([
            `UPDATE rooms SET p2ID = '${playerID}' WHERE roomID = '${roomID}';`,
            `UPDATE rooms SET p2Name = '${this.db.sanitizeString(playerName)}' WHERE roomID = '${roomID}';`,
            `UPDATE rooms SET p2Ready = false WHERE roomID = '${roomID}'`
        ]);
        return new response_1.response(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as player 2`);
    }
    async addSpectator(playerID, roomID) {
        //only adds spectators
        const roomData = await this.getRoomData(roomID);
        if (!roomData)
            return new response_1.response(true, 'addToRoom', playerID, 'room not exist');
        if (roomData['p3id']) {
            if (!roomData['p4id']) {
                await this.db.query(`UPDATE rooms SET p4ID = '${playerID}' WHERE roomID = '${roomID}'`);
                var player = 2;
            }
            else {
                //out of spectator slots
                return new response_1.response(true, "addSpectator", playerID, `failed to add player ${playerID} to room ${roomID} due to full spectator slots`, {});
            }
        }
        else {
            await this.db.query(`UPDATE rooms SET p3ID = '${playerID}' WHERE roomID = '${roomID}'`);
            var player = 1;
        }
        return new response_1.response(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as spectator number ${player}`, { "roomData": roomData });
    }
    async removeFromRoom(playerID, roomID) {
        //if player 1 is removed, room is deleted
        var roomData = await this.getRoomData(roomID);
        if (!roomData)
            return new response_1.response(true, 'addToRoom', playerID, 'room not exist');
        switch (playerID) {
            case roomData['p1id']: {
                //player is player 1
                //note: make sure to inform spectators that room closed
                await this.db.transac([
                    `DELETE FROM rooms WHERE roomID = '${roomID}'`,
                    `DROP TABLE IF EXISTS ${roomID}` //the ${roomID} table is created in gameControl
                ]);
                return new response_1.response(false, 'removeFromRoom', playerID, `the host left the room, successfully deleted room ${roomID}`, { 'oldRoomData': roomData });
            }
            case roomData['p2id']: {
                //player is player 2
                //note to self: inform player 1 and spectators that player 2 left after invoking this function
                await this.db.query(`UPDATE rooms SET p2ID = NULL WHERE roomID = '${roomID}'`);
                return new response_1.response(false, 'removeFromRoom', playerID, `player 2 left the room successfully in room ${roomID}`);
            }
            case roomData['p3id']: {
                //player 3 is a spectator
                if (roomData['p4id']) {
                    await this.db.transac([
                        `UPDATE rooms SET p3ID = '${roomData['p4id']}' WHERE roomID = '${roomID}'`,
                        `UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`
                    ]);
                }
                else {
                    await this.db.query(`UPDATE rooms SET p3ID = NULL WHERE roomID = '${roomID}'`);
                }
                return new response_1.response(false, 'removeFromRoom', playerID, `spectator 1 left in room ${roomID}`, {});
            }
            case roomData['p4id']: {
                //player 4 is a spectator
                await this.db.query(`UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`);
                return new response_1.response(false, 'removeFromRoom', playerID, `spectator 2 left in room ${roomID}`, {});
            }
            default: {
                return new response_1.response(true, 'removeFromRoom', playerID, `playerID not exist in room ${roomID}`, { 'roomData': roomData });
            }
        }
    }
    //note to self: change this function to check if shipdata is uploaded
    //add a function to upload shipdata, either here or game control
    async setReady(playerID, roomID, isReady) {
        const roomData = await this.getRoomData(roomID);
        if (!roomData)
            return new response_1.response(true, 'addToRoom', playerID, 'room not exist');
        let res = {
            "gameStarted": false
        };
        if (roomData['p1id'] == playerID) {
            //player is player 1
            await this.db.query(`UPDATE rooms SET p1Ready = ${isReady} WHERE roomID = '${roomID}';`);
            if (isReady && roomData['p2ready']) {
                //both player ready, initiate game
                //await gameController.init(roomID)
                res.gameStarted = true;
                return new response_1.response(false, "setReady", playerID, `both player set status as ready in room ${roomID}, game started`, res);
            }
            return new response_1.response(false, "setReady", playerID, `player ${playerID} successfully set ready status as ${isReady} in room ${roomID}`, res);
        }
        else if (roomData['p2id'] == playerID) {
            //player is player 2
            await this.db.query(`UPDATE rooms SET p2Ready = ${isReady} WHERE roomID = '${roomID}';`);
            if (isReady && roomData['p1ready']) {
                //both player ready, initiate game
                //await gameController.init(roomID)
                res.gameStarted = true;
                return new response_1.response(false, "setReady", playerID, `both player set status as ready in room ${roomID}, game started`, res);
            }
            return new response_1.response(false, "setReady", playerID, `player ${playerID} successfully set ready status as ${isReady} in room ${roomID}`, res);
        }
        else {
            //player not belong to this room
            return new response_1.response(true, "setReady", playerID, `player ${playerID} is not in room ${roomID}`, res);
        }
    }
    //unsanitized method, do not leak direct access to user
    async getRoomOfUserFromID(userID) {
        if (userID) {
            let x = await this.db.query(`
        SELECT * FROM rooms WHERE p1ID = '${userID}' OR p2ID = '${userID}' OR p3ID = '${userID}' OR p4ID = '${userID}'
      `);
            if (!x || !x.length) {
                return {
                    'playerID': userID,
                    'player': -1,
                    'isSpectator': false
                };
            }
            let a = x[0];
            switch (userID) {
                case a['p1id']: {
                    return {
                        'roomID': a['roomid'],
                        'playerID': userID,
                        'player': 1,
                        'name': a['p1name'],
                        'isSpectator': false,
                        'roomData': a
                    };
                }
                case a['p2id']: {
                    return {
                        'roomID': a['roomid'],
                        'playerID': userID,
                        'player': 2,
                        'name': a['p2name'],
                        'isSpectator': false,
                        'roomData': a
                    };
                }
                case a['p3id']: {
                    return {
                        'roomID': a['roomid'],
                        'playerID': userID,
                        'player': 3,
                        'name': null,
                        'isSpectator': true,
                        'roomData': a
                    };
                }
                case a['p4id']: {
                    return {
                        'roomID': a['roomid'],
                        'playerID': userID,
                        'player': 4,
                        'name': null,
                        'isSpectator': true,
                        'roomData': a
                    };
                }
            }
        }
        else {
            return undefined;
        }
    }
}
exports.roomController = roomController;
