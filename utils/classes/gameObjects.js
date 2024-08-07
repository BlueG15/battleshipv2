"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameObj = exports.playerObj = exports.shipObj = void 0;
const position_1 = require("./position");
class shipObj {
    constructor(shipID, pos, rot) {
        this.shipID = shipID !== null && shipID !== void 0 ? shipID : "NULL"; //string length 10
        if (pos instanceof position_1.IntPosition) {
            this.pos = pos;
        }
        else {
            this.pos = (pos && pos.length == 2) ? new position_1.IntPosition(pos) : new position_1.IntPosition([-1, -1]); //array of int
        }
        this.rot = rot !== null && rot !== void 0 ? rot : -1; //int
    }
    convertToSQL() {
        return `ROW('${this.shipID}', ARRAY[${this.pos.toString()}]::SMALLINT[], ${this.rot})`;
    }
}
exports.shipObj = shipObj;
class playerObj {
    constructor(isTurn, energy, energyPerTurn, shipObjArray) {
        if (typeof isTurn == 'string') {
            //from pgResString contructor
            let a = isTurn.split(',');
            this.isTurn = (a[0].slice(-1) == 't') ? true : false;
            this.energy = Number(a[1]);
            this.energyPerTurn = Number(a[2]);
            if (!a[4]) {
                this.shipObjArray = null;
                return;
            }
            let p = 3;
            this.shipObjArray = [];
            while (p < a.length) {
                let k = new shipObj(a[p].split('(').slice(-1)[0], new position_1.IntPosition(Number(a[p + 1].split('{').slice(-1)[0]), Number(a[p + 2].split('}')[0])), Number(a[p + 3].split(')')[0]));
                this.shipObjArray.push(k);
                p = p + 4;
            }
            return;
        }
        this.isTurn = isTurn !== null && isTurn !== void 0 ? isTurn : false; //boolean
        this.energy = energy !== null && energy !== void 0 ? energy : -1; //int
        this.energyPerTurn = energyPerTurn !== null && energyPerTurn !== void 0 ? energyPerTurn : 1; //int
        this.shipObjArray = shipObjArray !== null && shipObjArray !== void 0 ? shipObjArray : null; //ship object
    }
    convertToSQL() {
        if (this.shipObjArray)
            return `
      ROW(
        ${this.isTurn},
        ${this.energy},
        ${this.energyPerTurn},
        ARRAY[
          ${this.shipObjArray.map(i => i.convertToSQL()).join(", ")}
        ]::SHIPOBJ[]
      )::PLAYEROBJ
    `;
        else {
            return `ROW(
          ${this.isTurn},
          ${this.energy},
          ${this.energyPerTurn},
          null
      )::PLAYEROBJ
      `;
        }
    }
}
exports.playerObj = playerObj;
class gameObj {
    constructor(roomID, mode, p1Obj, p2Obj, turnCount, phase) {
        this.roomID = roomID, //string length 6
            this.mode = mode !== null && mode !== void 0 ? mode : -1, //INT
            this.p1Obj = (typeof p1Obj == 'string') ? new playerObj(p1Obj) : (p1Obj !== null && p1Obj !== void 0 ? p1Obj : new playerObj()); //player object
        this.p2Obj = (typeof p2Obj == 'string') ? new playerObj(p2Obj) : (p2Obj !== null && p2Obj !== void 0 ? p2Obj : new playerObj()); //player object
        this.turnCount = turnCount !== null && turnCount !== void 0 ? turnCount : -1; //INT
        this.phase = phase !== null && phase !== void 0 ? phase : -1; //INT
    }
    convertToSQL() {
        return `
    '${this.roomID}',
    ${this.mode},
    ${this.p1Obj.convertToSQL()},
    ${this.p2Obj.convertToSQL()},
    ${this.turnCount},
    ${this.phase}
  `;
    }
}
exports.gameObj = gameObj;
