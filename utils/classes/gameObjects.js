"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameObj = exports.playerObj = exports.shipObj = void 0;
const position_1 = require("./position");
const response_1 = require("./response");
const cryptEngine_1 = __importDefault(require("../func/cryptEngine"));
const utils_1 = __importDefault(require("../func/utils"));
class shipObj {
    constructor(shipID, pos, isVertical) {
        this.shipID = shipID !== null && shipID !== void 0 ? shipID : "NULL"; //string length 10
        if (pos instanceof position_1.IntPosition) {
            this.pos = pos;
        }
        else {
            this.pos = (pos && pos.length == 2) ? new position_1.IntPosition(pos) : new position_1.IntPosition([-1, -1]); //array of int
        }
        this.isVertical = isVertical !== null && isVertical !== void 0 ? isVertical : false; //int
    }
    sanitizeSelf() {
        let modulesArr = cryptEngine_1.default.decrypt(this.shipID);
        if (modulesArr instanceof response_1.response)
            return modulesArr;
        return {
            pos: [this.pos.x, this.pos.y], //length = 2
            isVertical: this.isVertical,
            modulesArr: modulesArr.moduleNameArr,
            shipType: modulesArr.shipType,
        };
    }
}
exports.shipObj = shipObj;
class playerObj {
    constructor(id, name, isTurn, energy, modArr, shipObjArray) {
        this.id = id;
        this.name = name;
        this.isTurn = isTurn !== null && isTurn !== void 0 ? isTurn : false; //boolean
        this.energy = energy !== null && energy !== void 0 ? energy : -1; //int
        // this.energyPerTurn = energyPerTurn ?? 1 //int
        this.modArr = modArr !== null && modArr !== void 0 ? modArr : [];
        this.shipObjArray = shipObjArray !== null && shipObjArray !== void 0 ? shipObjArray : null; //ship object
    }
    santizeSelf(roomID, isHost, isReady, timePerRound, timeBonus) {
        let arr;
        if (!this.shipObjArray)
            arr = undefined;
        else {
            arr = [];
            for (let i = 0; i < this.shipObjArray.length; i++) {
                let k = this.shipObjArray[i].sanitizeSelf();
                if (k instanceof response_1.response) {
                    arr = undefined;
                    break;
                }
                arr[i] = k;
            }
        }
        return {
            roomID: roomID,
            isHost: isHost,
            name: this.name,
            isTurn: this.isTurn,
            isReady: isReady,
            energy: this.energy,
            modArr: this.modArr,
            shipObjArray: arr,
            timePerRound: timePerRound,
            timeBonus: timeBonus
        };
    }
}
exports.playerObj = playerObj;
class gameObj {
    constructor(roomID, mode, timePerPlayer, timeBonus, p1Obj, p2Obj, turnCount, phase) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.fail = false;
        this.failRes = [];
        this.maxSpectatorCount = 2; //do not change this value without changing pg structure
        this.readyState = [false, false];
        this.spectatorID = [];
        if (typeof roomID == 'object') {
            this.roomID = roomID.roomid;
            this.readyState = [(_a = roomID.p1ready) !== null && _a !== void 0 ? _a : false, (_b = roomID.p2ready) !== null && _b !== void 0 ? _b : false];
            this.timePerPlayer = (_c = roomID.timepp) !== null && _c !== void 0 ? _c : 300000;
            this.timeBonus = (_d = roomID.timebonus) !== null && _d !== void 0 ? _d : 0;
            this.mode = roomID.mode;
            this.turnCount = roomID.turncount;
            this.phase = roomID.phase;
            if (!roomID.p1id)
                this.p1Obj = null;
            else {
                let name1 = (_e = roomID.p1name) !== null && _e !== void 0 ? _e : "p1";
                let mod1 = (roomID.p1mod) ? cryptEngine_1.default.decryptGeneric(roomID.p1mod) : undefined;
                let ship1 = [];
                let str1 = (roomID.p1shipstr) ? roomID.p1shipstr.split('/') : undefined;
                let rot1 = (roomID.p1shiprot && str1 && str1.length) ? cryptEngine_1.default.numToBooleanArr(roomID.p1shiprot, str1.length) : undefined;
                if (str1 && roomID.p1shipx && roomID.p1shipy && rot1 && !(rot1 instanceof response_1.response)) {
                    str1.forEach((i, index) => {
                        if (!roomID.p1shipx || !roomID.p1shipx[index] || !roomID.p1shipy || !roomID.p1shipy[index]) {
                            return new response_1.response(true, "gameObj_constructor", "unknown", `failed to parsed shipObj`, { shipArr: ship1, shipstr: str1, shiprot: rot1, index: index });
                        }
                        ship1.push(new shipObj(i, new position_1.IntPosition(roomID.p1shipx[index], roomID.p1shipy[index]), rot1[index]));
                    });
                }
                let p1 = new playerObj(roomID.p1id, name1, (_f = roomID.isp1turn) !== null && _f !== void 0 ? _f : undefined, (_g = roomID.p1energy) !== null && _g !== void 0 ? _g : undefined, (mod1 instanceof response_1.response) ? undefined : mod1, ship1);
                if (mod1 instanceof response_1.response) {
                    this.fail = true;
                    this.failRes.push(mod1);
                }
                if (rot1 instanceof response_1.response) {
                    this.fail = true;
                    this.failRes.push(rot1);
                }
                this.p1Obj = p1;
            }
            if (!roomID.p2id)
                this.p2Obj = null;
            else {
                let name2 = (_h = roomID.p2name) !== null && _h !== void 0 ? _h : "p2";
                let mod2 = (roomID.p2mod) ? cryptEngine_1.default.decryptGeneric(roomID.p2mod) : undefined;
                let ship2 = [];
                let str2 = (roomID.p2shipstr) ? roomID.p2shipstr.split('/') : undefined;
                let rot2 = (roomID.p2shiprot && str2 && str2.length) ? cryptEngine_1.default.numToBooleanArr(roomID.p2shiprot, str2.length) : undefined;
                if (str2 && roomID.p2shipx && roomID.p2shipy && rot2 && !(rot2 instanceof response_1.response)) {
                    str2.forEach((i, index) => {
                        if (!roomID.p2shipx || !roomID.p2shipx[index] || !roomID.p2shipy || !roomID.p2shipy[index]) {
                            return new response_1.response(true, "gameObj_constructor", "unknown", `failed to parsed shipObj`, { shipArr: ship2, shipstr: str2, shiprot: rot2, index: index });
                        }
                        ship2.push(new shipObj(i, new position_1.IntPosition(roomID.p2shipx[index], roomID.p2shipy[index]), rot2[index]));
                    });
                }
                let p2 = new playerObj(roomID.p2id, name2, (roomID.isp1turn) ? !(roomID.isp1turn) : undefined, (_j = roomID.p2energy) !== null && _j !== void 0 ? _j : undefined, (mod2 instanceof response_1.response) ? undefined : mod2, ship2);
                if (mod2 instanceof response_1.response) {
                    this.fail = true;
                    this.failRes.push(mod2);
                }
                if (rot2 instanceof response_1.response) {
                    this.fail = true;
                    this.failRes.push(rot2);
                }
                this.p2Obj = p2;
            }
            if (roomID.p3id)
                this.addSpectator(roomID.p3id);
            if (roomID.p4id)
                this.addSpectator(roomID.p4id);
            return;
        }
        this.roomID = roomID; //string length 6
        this.mode = mode !== null && mode !== void 0 ? mode : null; //INT
        this.timePerPlayer = timePerPlayer !== null && timePerPlayer !== void 0 ? timePerPlayer : 300000; //5 minutes
        this.timeBonus = timeBonus !== null && timeBonus !== void 0 ? timeBonus : 0;
        this.p1Obj = p1Obj !== null && p1Obj !== void 0 ? p1Obj : null; //player object
        this.p2Obj = p2Obj !== null && p2Obj !== void 0 ? p2Obj : null; //player object
        this.turnCount = turnCount !== null && turnCount !== void 0 ? turnCount : null; //INT
        this.phase = phase !== null && phase !== void 0 ? phase : null; //INT
    }
    addSpectator(id) {
        if (this.spectatorID.length == this.maxSpectatorCount)
            return new response_1.response(true, "addSpectatorToGameObj", "unknown", "max spectator count", { spectators: this.spectatorID, max: this.maxSpectatorCount });
        this.spectatorID.push(id);
    }
    toggleReady(player) {
        this.readyState[player - 1] = !this.readyState[player - 1];
    }
    convertPreSQL() {
        let p1mod = (!this.p1Obj || !this.p1Obj.modArr.length) ? undefined : cryptEngine_1.default.encryptGeneric(this.p1Obj.modArr);
        if (p1mod instanceof response_1.response) {
            return p1mod;
        }
        let p2mod = (!this.p2Obj || !this.p2Obj.modArr.length) ? undefined : cryptEngine_1.default.encryptGeneric(this.p2Obj.modArr);
        if (p2mod instanceof response_1.response) {
            return p2mod;
        }
        let p1shipstr = [];
        let p1shipx = [];
        let p1shipy = [];
        let p1shiprot = [];
        if (this.p1Obj && this.p1Obj.shipObjArray) {
            this.p1Obj.shipObjArray.forEach((i, index) => {
                p1shipstr[index] = i.shipID;
                p1shipx[index] = i.pos.x;
                p1shipy[index] = i.pos.y;
                p1shiprot[index] = i.isVertical;
            });
        }
        let p2shipstr = [];
        let p2shipx = [];
        let p2shipy = [];
        let p2shiprot = [];
        if (this.p2Obj && this.p2Obj.shipObjArray) {
            this.p2Obj.shipObjArray.forEach((i, index) => {
                p2shipstr[index] = i.shipID;
                p2shipx[index] = i.pos.x;
                p2shipy[index] = i.pos.y;
                p2shiprot[index] = i.isVertical;
            });
        }
        let p1shipR = (!p1shiprot.length) ? undefined : cryptEngine_1.default.booleanArrToNum(p1shiprot);
        if (p1shipR instanceof response_1.response) {
            return p1shipR;
        }
        let p2shipR = (!p2shiprot.length) ? undefined : cryptEngine_1.default.booleanArrToNum(p2shiprot);
        if (p2shipR instanceof response_1.response) {
            return p2shipR;
        }
        return {
            roomid: this.roomID,
            p1id: (!this.p1Obj || !this.p1Obj.id) ? undefined : this.p1Obj.id,
            p1name: (!this.p1Obj || !this.p1Obj.name) ? undefined : this.p1Obj.name,
            p1ready: this.readyState[0],
            p2id: (!this.p2Obj || !this.p2Obj.id) ? undefined : this.p2Obj.id,
            p2name: (!this.p2Obj || !this.p2Obj.name) ? undefined : this.p2Obj.name,
            p2ready: this.readyState[1],
            p3id: (this.spectatorID.length < 1) ? undefined : this.spectatorID[0],
            p4id: (this.spectatorID.length < 2) ? undefined : this.spectatorID[1],
            timepp: this.timePerPlayer,
            timebonus: this.timeBonus,
            isp1turn: (!this.p1Obj) ? undefined : this.p1Obj.isTurn,
            mode: (!this.mode && this.mode != 0) ? undefined : this.mode,
            turncount: (!this.turnCount && this.turnCount != 0) ? undefined : this.turnCount,
            phase: (!this.phase && this.phase != 0) ? undefined : this.phase,
            p1energy: (!this.p1Obj) ? undefined : this.p1Obj.energy,
            p2energy: (!this.p2Obj) ? undefined : this.p2Obj.energy,
            p1mod: p1mod,
            p2mod: p2mod,
            p1shipstr: (p1shipstr.length) ? p1shipstr.join("/") : undefined,
            p2shipstr: (p2shipstr.length) ? p2shipstr.join("/") : undefined,
            p1shipx: (p1shipx.length) ? p1shipx : undefined,
            p2shipx: (p2shipx.length) ? p2shipx : undefined,
            p1shipy: (p1shipy.length) ? p1shipy : undefined,
            p2shipy: (p2shipy.length) ? p2shipy : undefined,
            p1shiprot: (p1shiprot.length) ? p1shipR : undefined,
            p2shiprot: (p2shiprot.length) ? p2shipR : undefined
        };
    }
    convertToDBinteractionData(gameObjBefore) {
        let a = this.convertPreSQL();
        if (a instanceof response_1.response)
            return a;
        let res = {
            fields: [],
            values: []
        };
        let index = 0;
        Object.keys(a).forEach((i) => {
            var _a;
            let temp = i;
            if (gameObjBefore) {
                let lhs = JSON.stringify(gameObjBefore[temp], null, 0);
                let rhs = JSON.stringify(a[temp], null, 0);
                if (lhs != rhs) {
                    res.fields.push(temp);
                    res.values.push(utils_1.default.convertToPGValue(a[temp]));
                    index++;
                }
            }
            else {
                //use all values, even the empty ones
                res.fields[index] = temp;
                res.values[index] = utils_1.default.convertToPGValue((_a = a[temp]) !== null && _a !== void 0 ? _a : undefined);
                index++;
            }
        });
        return res;
    }
    sanitizeSelf() {
        var _a, _b;
        return {
            roomID: this.roomID,
            spectatorCount: this.spectatorID.length,
            mode: (!this.mode && this.mode != 0) ? undefined : this.mode,
            p1Obj: (this.p1Obj) ? this.p1Obj.santizeSelf(this.roomID, true, this.readyState[0], this.timePerPlayer, this.timeBonus) : undefined,
            p2Obj: (this.p2Obj) ? this.p2Obj.santizeSelf(this.roomID, false, this.readyState[1], this.timePerPlayer, this.timeBonus) : undefined,
            turnCount: (_a = this.turnCount) !== null && _a !== void 0 ? _a : undefined,
            phase: (_b = this.phase) !== null && _b !== void 0 ? _b : undefined
        };
    }
    isSpectatorFull() {
        return this.spectatorID.length >= this.maxSpectatorCount;
    }
    getPlayerType(playerID) {
        let res = {
            playerType: undefined,
            index: undefined,
        };
        if (this.spectatorID.includes(playerID)) {
            res.playerType = 'spectator';
            res.index = this.spectatorID.indexOf(playerID);
            return res;
        }
        if (this.p1Obj && this.p1Obj.id == playerID) {
            res.playerType = 'player';
            res.index = 1;
            return res;
        }
        if (this.p2Obj && this.p2Obj.id == playerID) {
            res.playerType = 'player';
            res.index = 2;
            return res;
        }
        return res;
    }
}
exports.gameObj = gameObj;
