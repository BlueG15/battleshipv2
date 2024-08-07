"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = void 0;
//import { response } from "../utils/classes/response"
const gameObjects_1 = require("../utils/classes/gameObjects");
//note to self: update this file, this sucks
class gameController {
    constructor(db) {
        this.db = db;
    }
    async defineType() {
        await this.db.transac([
            `CREATE TYPE SHIPOBJ AS (
          shipID VARCHAR(10),
          pos SMALLINT[2],
          rot SMALLINT
        );`,
            `CREATE TYPE PLAYEROBJ AS (
          isTurn BOOLEAN,
          energy SMALLINT,
          energyPerTurn SMALLINT,
          shipObj SHIPOBJ[5]
        );`
        ]);
        return;
    }
    async init(roomID, P1Obj, P2Obj) {
        let q = [
            `CREATE TABLE IF NOT EXISTS gamedata (
          roomID VARCHAR(7) PRIMARY KEY,
          mode SMALLINT,
          p1Obj PLAYEROBJ,
          p2Obj PLAYEROBJ,
          turnCount SMALLINT,
          phase SMALLINT
        );`
        ];
        if (roomID)
            q.push(`INSERT INTO gamedata (roomID, mode, p1Obj, p2Obj, turnCount, phase) VALUES (${new gameObjects_1.gameObj(roomID, undefined, P1Obj, P2Obj).convertToSQL()});`);
        await this.db.transac(q);
    }
    async updatePlayer1Data(roomID, playerObj) {
        await this.db.query(`UPDATE gamedata SET p1Obj = ${playerObj.convertToSQL()} WHERE roomID = ${roomID}`);
        return;
    }
    async updatePlayer2Data(roomID, playerObj) {
        await this.db.query(`UPDATE gamedata SET p2Obj = ${playerObj.convertToSQL()} WHERE roomID = ${roomID}`);
        return;
    }
    async updateAllRoomMetaData(roomID, mode, turnCount, phase) {
        await this.db.query(`
        UPDATE gamedata 
        SET mode = ${mode},
            turnCount = ${turnCount},
            phase = ${phase}
        WHERE roomID = ${roomID}`);
        return;
    }
    async updateTurnCount(roomID, turnCount) {
        await this.db.query(`
        UPDATE gamedata 
        SET turnCount = ${turnCount}
        WHERE roomID = ${roomID}`);
        return;
    }
    async updatePhase(roomID, phase) {
        await this.db.query(`
        UPDATE gamedata 
        SET phase = ${phase}
        WHERE roomID = ${roomID}`);
        return;
    }
    async updateMode(roomID, mode) {
        await this.db.query(`
        UPDATE gamedata 
        SET mode = ${mode}
        WHERE roomID = ${roomID}`);
        return;
    }
    async getGameData(roomID) {
        var a = await this.db.query(`SELECT * FROM gamedata WHERE roomID = ${roomID}`);
        if (!a || !a.length)
            return undefined;
        let x = a[0];
        return new gameObjects_1.gameObj(x.roomid, x.mode, x.p1obj, x.p2obj, x.turncount, x.phase);
    }
}
exports.gameController = gameController;
