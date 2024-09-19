"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const response_1 = require("../utils/classes/response");
//import {default as gameController} from "./gameControl"
const utils_1 = __importDefault(require("../utils/func/utils"));
const gameObjects_1 = require("../utils/classes/gameObjects");
class roomController {
    constructor(db) {
        this.roomIDLength = 6;
        this.maxRetriesPerLoop = 1000;
        this.maxLoop = 6;
        this.allowedModes = [-1, 0, 1];
        this.db = db;
    }
    async dropRoomTable() {
        await this.db.query(`
      DROP TABLE IF EXISTS rooms;
    `);
        return;
    }
    //DO NOT ACTIVATE THIS
    //this is from a time where database cannot be sent SQL separately
    //this time we use vercel, table already exist, no need
    async init() {
        await this.db.query(`CREATE TABLE IF NOT EXISTS rooms (
          roomid VARCHAR(10) PRIMARY KEY,

          p1id VARCHAR(20),
          p1name VARCHAR(20),
          p1ready BOOLEAN,

          p2id VARCHAR(20),
          p2name VARCHAR(20),
          p2ready BOOLEAN,

          p3id VARCHAR(20),
          p4id VARCHAR(20),

          timepp INTEGER,
          timebonus INTEGER,

          isp1turn BOOLEAN,
          mode SMALLINT,
          turncount SMALLINT,
          phase SMALLINT,
          
          p1energy SMALLINT,
          p2energy SMALLINT,

          p1mod TEXT,
          p2mod TEXT,

          p1shipstr TEXT,
          p2shipstr TEXT,

          p1shipx SMALLINT[6],
          p2shipx SMALLINT[6],

          p1shipy SMALLINT[6],
          p2shipy SMALLINT[6],

          p1shiprot SMALLINT,
          p2shiprot SMALLINT
      );`); //p3 and p4 are spectators
        return 0;
    }
    //keep these two old methods since they just get data
    async getRoomData(roomID) {
        const res = await this.db.query(`SELECT * FROM rooms WHERE roomID = '${roomID}'`);
        if (!res || !res.length)
            return undefined;
        return new gameObjects_1.gameObj(res[0]); //object, empty if nothing found
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
    async insertNewGameRow(gameObj) {
        //rewrite
        if (gameObj.fail)
            return gameObj.failRes[0];
        let k = gameObj.convertToDBinteractionData();
        if (k instanceof response_1.response)
            return k;
        return this.db.insertRow("rooms", k.fields, k.values);
    }
    async changeGameRow(gameObj) {
        //rewrite
        if (gameObj.fail)
            return gameObj.failRes[0];
        let k = gameObj.convertToDBinteractionData();
        if (k instanceof response_1.response)
            return k;
        return this.db.updateTable("rooms", k.fields, k.values, "roomID", gameObj.roomID);
    }
    //TASKs RN:
    //rewrite old methods, using the ones above
    //createRoomAndInsertP1 ---- done
    //insertP2 ---- done
    //insertSpectator ---- done
    //removeFromRoom ---- done
    //changePlayerData ---- done
    //updateMetaData
    retriesUntilGotRoomID(exist) {
        for (let i = 0; i < this.maxLoop; i++) {
            for (let count = 0; count < this.maxRetriesPerLoop; count++) {
                let roomID = utils_1.default.generateRandomID(this.roomIDLength);
                if (!exist.includes(roomID))
                    return roomID;
            }
            this.roomIDLength++;
        }
        return undefined;
    }
    async createRoomAndInsertPlayer1(p1, mode) {
        ;
        if (!this.allowedModes.includes(mode))
            return new response_1.response(true, "createRoomAndInsertPlayer1", p1.name, "wrong mode number", { input: mode });
        const exist = await this.db.query(`SELECT roomID FROM rooms`);
        if (!exist)
            return new response_1.response(true, 'createRoom', p1.name, 'somehow fail to execute query SELECT roomID FROM rooms, exist returns undefined');
        let roomID = this.retriesUntilGotRoomID(exist);
        if (!roomID) {
            //fail to create room, data base full
            return new response_1.response(true, "createRoom", p1.name, `Fail to create a new room, database full, considering restarting it, rooms should NOT last this long`, { "exist": exist });
        }
        let game = new gameObjects_1.gameObj(roomID, mode, undefined, undefined, p1, undefined, -1, -1);
        let toDB = game.convertToDBinteractionData();
        if (toDB instanceof response_1.response)
            return new response_1.response(true, toDB.event + "_" + "createRoomAndInsertP1", p1.name, toDB.note, { exist: [toDB.data] });
        await this.db.insertRow("rooms", toDB.fields, toDB.values);
        //note to self: socket.send to playerID what this resolves
        return new response_1.response(false, 'createRoom', p1.name, `player ${p1.name} successfully created new room with roomID = ${roomID}`, game.sanitizeSelf());
    }
    async insertPlayer2(roomID, p2) {
        let game = await this.getRoomData(roomID);
        if (!game)
            return new response_1.response(true, "insertP2", p2.name, "invalid roomID", { roomID: roomID });
        if (game.p2Obj && game.p2Obj.id) {
            return new response_1.response(true, "insertP2", p2.name, "room full", { roomID: roomID });
        }
        game.p2Obj = p2;
        let toDB = game.convertToDBinteractionData();
        if (toDB instanceof response_1.response)
            return new response_1.response(true, toDB.event + "_" + "insertP2", p2.name, toDB.note, { roomID: roomID });
        await this.db.updateTable("rooms", toDB.fields, toDB.values, 'roomid', roomID);
        return new response_1.response(false, "insertP2", p2.name, `successfully insert player ${p2.name} into room ${roomID}`, game.sanitizeSelf());
    }
    async insertSpectator(roomID, spectatorID) {
        let game = await this.getRoomData(roomID);
        if (!game)
            return new response_1.response(true, "insertSpectator", spectatorID, "invalid roomID", { roomID: roomID });
        if (game.isSpectatorFull()) {
            return new response_1.response(true, "insertSpectator", spectatorID, "room full", { roomID: roomID });
        }
        game.addSpectator(spectatorID);
        let before = game.convertPreSQL();
        if (before instanceof response_1.response)
            return new response_1.response(true, before.event + "_" + "insertSpectator", spectatorID, before.note, { roomID: roomID });
        let toDB = game.convertToDBinteractionData(before);
        if (toDB instanceof response_1.response)
            return new response_1.response(true, toDB.event + "_" + "insertSpectator", spectatorID, toDB.note, { roomID: roomID });
        await this.db.updateTable("rooms", toDB.fields, toDB.values, 'roomid', roomID);
        return new response_1.response(false, "insertSpectator", spectatorID, `successfully insert spectator ${spectatorID} into room ${roomID}`, game.sanitizeSelf());
    }
    async removeFromRoom(roomID, playerID) {
        //can have race condition sadly hmmmm
        //i think its fixxed now, values only updates in the fields that differs since when its fetched
        var _a, _b, _c;
        let game = await this.getRoomData(roomID);
        if (!game)
            return new response_1.response(true, "removeFromRoom", playerID, "invalid roomID", { roomID: roomID });
        //check spectator
        let k = game.getPlayerType(playerID);
        if (!k.playerType || !k.index)
            return new response_1.response(true, "removeFromRoom", playerID, "player NOT in room", (() => { let r = game.sanitizeSelf(); r.playerRemoved = 0; return r; })());
        let before = game.convertPreSQL();
        if (before instanceof response_1.response)
            return new response_1.response(true, before.event + "_" + "removeSpectatorFromRoom", playerID, before.note, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 0; return r; })());
        if (k.playerType == 'spectator') {
            game.spectatorID = game.spectatorID.filter(i => i != playerID);
            let toDB = game.convertToDBinteractionData(before);
            if (toDB instanceof response_1.response)
                return new response_1.response(true, toDB.event + "_" + "removeSpectatorFromRoom", playerID, toDB.note, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 0; return r; })());
            await this.db.updateTable('rooms', toDB.fields, toDB.values, 'roomid', roomID);
            //note to self: notify all players in the room of new gameObj data
            return new response_1.response(false, "removeFromRoom", playerID, `removedSpectator with id = ${playerID} from room ${roomID}`, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 3; return r; })());
        }
        else {
            if (k.index == 1) {
                //transfer room to P2, let P2 become host
                game.p1Obj = game.p2Obj;
                game.p2Obj = null;
                if (!game.p1Obj) { //room empty, both player left, delete room
                    await this.db.deleteRow('rooms', 'roomid', roomID);
                    //noteToSelf: notify players that room fucking closed
                    return new response_1.response(false, "removeFromRoom", playerID, `removed host - room gone`, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 1; return r; })());
                }
                else {
                    let toDB = game.convertToDBinteractionData(before);
                    if (toDB instanceof response_1.response)
                        return new response_1.response(true, toDB.event + "_" + "removeP1FromRoom", (_a = before.p1name) !== null && _a !== void 0 ? _a : "unknown", toDB.note, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 0; return r; })());
                    await this.db.updateTable('rooms', toDB.fields, toDB.values, 'roomid', roomID);
                    //await this.db.setValuesNULL('rooms', ['p2obj'], 'roomid', roomID)
                    return new response_1.response(false, "removeFromRoom", (_b = before.p1name) !== null && _b !== void 0 ? _b : "unknown", `removed P1, transfered owndership`, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 1; return r; })());
                }
            }
            else {
                game.p2Obj = null;
                let toDB = game.convertToDBinteractionData(before);
                if (toDB instanceof response_1.response)
                    return new response_1.response(true, toDB.event + "_" + "removeP2FromRoom", playerID, toDB.note, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 0; return r; })());
                await this.db.updateTable('rooms', toDB.fields, toDB.values, 'roomid', roomID);
                return new response_1.response(false, "removeFromRoom", (_c = before.p2name) !== null && _c !== void 0 ? _c : "unknown", `removed P2`, (() => { let r = game.sanitizeSelf(); r.playerRemoved = 2; return r; })());
            }
        }
    }
    async updatePlayerData(roomID, playerNum, p) {
        let game = await this.getRoomData(roomID);
        if (!game) {
            let game = new gameObjects_1.gameObj(roomID);
            game[`p${playerNum}Obj`] = p;
            return new response_1.response(true, "updatePlayerObj", p.name, "invalid roomID", game.sanitizeSelf());
        }
        let before = game.convertPreSQL();
        if (before instanceof response_1.response)
            return new response_1.response(true, "updatePlayerObj", p.name, "cannot convert to DB data", game.sanitizeSelf());
        game[`p${playerNum}Obj`] = p;
        let toDB = game.convertToDBinteractionData(before);
        if (toDB instanceof response_1.response)
            return new response_1.response(true, "updatePlayerObj", p.name, "cannot convert to DB data", game.sanitizeSelf());
        await this.db.updateTable('rooms', toDB.fields, toDB.values, 'roomid', roomID);
        return new response_1.response(true, "updatePlayerObj", p.name, `successfully update p${playerNum}Obj`, game.sanitizeSelf());
    }
    async overwriteGameObj(game) {
        //dangerous method
        //do not use, not reccomended
        let toDB = game.convertToDBinteractionData();
        if (toDB instanceof response_1.response)
            return new response_1.response(true, "overwriteGameObj", 'unknown', "cannot convert to DB data", game.sanitizeSelf());
        await this.db.updateTable('rooms', toDB.fields, toDB.values, 'roomid', game.roomID);
        return new response_1.response(true, "overwriteGameObj", 'unknown', `successfully update gameObj`, game.sanitizeSelf());
    }
}
exports.roomController = roomController;
