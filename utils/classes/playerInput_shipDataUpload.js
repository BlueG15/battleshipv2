"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleStepShipObj = void 0;
//first input: ship data + position register
const gameObjects_1 = require("./gameObjects");
const cryptEngine_1 = __importDefault(require("../func/cryptEngine"));
const position_1 = require("./position");
const response_1 = require("./response");
class middleStepShipObj {
    setFail() {
        this.fail = true;
        this.modulesArr = [];
        this.shipType = "";
        this.pos = [];
        this.isVertical = false;
    }
    constructor(a) {
        this.fail = false;
        this.requiredKeys = ["modulesArr", "shipType", "pos", "isVertical"];
        let keys = Object.keys(a);
        let k = {};
        this.requiredKeys.forEach(i => {
            if (!keys.includes(i)) {
                k[i] = true;
                this.setFail();
            }
        });
        if (keys.includes("modulesArr")) {
            if (!Array.isArray(a["modulesArr"]) || typeof a["modulesArr"][0] != 'string') {
                this.setFail();
                k['modulesArr'] = true;
            }
            else {
                this.modulesArr = a["modulesArr"];
            }
        }
        if (keys.includes("shipType")) {
            if (typeof a["shipType"] != 'string') {
                this.setFail();
                k['shipType'] = true;
            }
            else {
                this.shipType = a["shipType"];
            }
        }
        if (keys.includes("pos")) {
            if (!Array.isArray(a["pos"]) || a["pos"].length != 2 || typeof a["pos"][0] != 'number' || typeof a["pos"][1] != 'number') {
                this.setFail();
                k['pos'] = true;
            }
            else {
                this.pos = a["pos"];
            }
        }
        if (keys.includes("isVertical")) {
            if (typeof a["isVertical"] != 'boolean') {
                this.setFail();
                k['isVertical'] = true;
            }
            else {
                this.isVertical = a["isVertical"];
            }
        }
        this.failKey = Object.keys(k);
        if (this.failKey.length > 0) {
            this.setFail();
        }
    }
    convertToShipObj() {
        if (this.fail)
            return new response_1.response(true, "convertToShipObj", "unknown", "shipDataUpload is not complete", { "missing_fields": this.failKey });
        if (!this.modulesArr || !this.pos || !this.isVertical || !this.shipType)
            return new response_1.response(true, "convertToShipObj", "unknown", "shipDataUpload is not complete", { "missing_fields": this.failKey });
        ;
        let a = cryptEngine_1.default.encrypt(this.modulesArr, this.shipType);
        if (a instanceof response_1.response)
            return a;
        return new gameObjects_1.shipObj(a, new position_1.IntPosition(this.pos), this.isVertical);
    }
}
exports.middleStepShipObj = middleStepShipObj;
