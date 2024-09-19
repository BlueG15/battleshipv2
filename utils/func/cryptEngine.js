"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shipdata_1 = require("../../data/shipdata");
const response_1 = require("../classes/response");
class cryptEngine {
    constructor() {
        //WARNING
        //CANNOT WORK WITH NEGATIVE NUMBERS
        //USE INTERNALLY ONLY
        this.key = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        this.tooBigBarrier = 1e10;
        this.defaultLotLength = 1;
        this.dataKeys_modules = Object.keys(shipdata_1.defaultUnits);
        this.dataKeys_ships = Object.keys(shipdata_1.defaultShips);
        this.maxLoop = 3000;
    }
    baseNtobase10_temp(x, n) {
        if (n == 0 || isNaN(n))
            return undefined;
        if (x[0] == 0 && x.length == 1)
            return 0;
        let res = 0;
        for (let i = 0; i < x.length; i++) {
            if (isNaN(Number(x[x.length - i - 1])) || Number(x[x.length - i - 1]) < 0)
                return undefined;
            if (Number(x[x.length - i - 1]) == 0)
                continue;
            res += Number(x[x.length - i - 1]) * Math.pow(n, i);
        }
        return res;
    }
    base10tobaseN_temp(x, n) {
        if (isNaN(x) || isNaN(n) || x < 0)
            return undefined;
        if (n == 0)
            return undefined;
        if (x == 0)
            return [0]; //0 stays the same in every single base
        let res = [];
        let count = 0;
        while (x != 0 && count < this.maxLoop) {
            res.unshift(x % n);
            x = Math.floor(x / n);
            count++;
        }
        if (x != 0) {
            //error happens
            return undefined;
        }
        return res;
    }
    baseNtobase10(x) {
        let k_temp = [];
        for (let i = 0; i < x.length; i++) {
            k_temp[i] = this.key.indexOf(x[i]);
            if (k_temp[i] < 0)
                return new response_1.response(true, "decryption_baseNtobase10", "unknown", "input has characters outside range", { "input": x });
        }
        let k = this.baseNtobase10_temp(k_temp, this.key.length);
        if (!k && k != 0)
            return new response_1.response(true, "decryption_baseNtobase10", "unknown", "input empty or NaN", { "input": k_temp, "originalInput": x });
        if (k > this.tooBigBarrier)
            return new response_1.response(true, "decryption_baseNtobase10", "unknown", "result too big, alogrithm failed somehow", { "input": k_temp, "originalInput": x, "base": this.key.length, "output": k });
        return k;
    }
    base10tobaseN(x) {
        let k = this.base10tobaseN_temp(x, this.key.length);
        if (!k)
            return new response_1.response(true, "encryption_base10tobaseN", "unknown", "input empty or NaN", { "input": x });
        let str = "";
        for (let i = 0; i < k.length; i++) {
            str += this.key[k[i]];
        }
        return str;
    }
    splitStrIntoChunks(str, chunkSize) {
        if (chunkSize <= 0)
            return null;
        let reg = new RegExp(`.{1,${chunkSize}}`, 'g');
        return str.match(reg);
    }
    encrypt(moduleNameArr, shipType) {
        //encrypt scheme
        //let a = number[] with number being the index of the module in the database
        //a.map(i => base10tobaseN(i, key.length) );
        //finds out the longest number in the array -> k
        //a.map again to pad each numbers to k length, fixxed
        //return k + "." + arr.join("")
        //the k.part is optional is k is equal to default length, in which case its 1
        let a = [];
        let longestLength = -1;
        let index = this.dataKeys_ships.indexOf(shipType);
        if (index < 0)
            return new response_1.response(true, "encrypt-ship-module", "unknown", "ship type not in database", { "shipType": shipType });
        let k = this.base10tobaseN(index);
        if (k instanceof response_1.response)
            return k;
        a[0] = k;
        longestLength = k.length;
        for (let i = 0; i < moduleNameArr.length; i++) {
            let index = this.dataKeys_modules.indexOf(moduleNameArr[i]);
            if (index < 0)
                return new response_1.response(true, "encrypt-ship-module", "unknown", "module id not in database", { "moduleid": moduleNameArr[i] });
            let k = this.base10tobaseN(index);
            if (k instanceof response_1.response)
                return k;
            a[i + 1] = k;
            longestLength = Math.max(longestLength, k.length);
        }
        if (longestLength <= 0)
            return new response_1.response(true, "encrypt-ship-module", "unknown", "input empty", { "moduleidArr": moduleNameArr });
        if (longestLength > 1) {
            for (let i = 0; i < a.length; i++) {
                a[i] = a[i].padStart(longestLength, "0"); // thank god this feature exist
            }
        }
        if (longestLength == this.defaultLotLength)
            return a.join("");
        else
            return `${longestLength}.${a.join("")}`;
    }
    decrypt(a) {
        var _a;
        let lotLength = this.defaultLotLength;
        let k = a.split(".");
        if (k.length != 1 && k.length != 2)
            return new response_1.response(true, "decrypt-module-arr", "unknown", "input not follow expected format - too many dots (.)", { "input": a });
        if (k.length == 2) {
            lotLength = Number(k[0]);
            if (isNaN(lotLength) || lotLength < 0 || lotLength >= a.length)
                return new response_1.response(true, "decrypt-module-arr", "unknown", "input not follow expected format - invalid lot length", { "input": a });
        }
        let str = k[k.length - 1];
        k = (_a = this.splitStrIntoChunks(str, lotLength)) !== null && _a !== void 0 ? _a : [];
        if (!k.length)
            return new response_1.response(true, "decrypt-module-arr", "unknown", "failed to split input into chunks of specified size", { "input": a });
        let res = {
            shipType: "",
            moduleNameArr: []
        };
        for (let i = 0; i < k.length; i++) {
            let temp = this.baseNtobase10(k[i]);
            if (temp instanceof response_1.response)
                return temp;
            if (i == 0) {
                if (temp >= this.dataKeys_ships.length)
                    return new response_1.response(true, "decrypt-module-arr", "unknown", "invalid ship type index after decrypt", { "input": a, "invalidIndex": temp, "convertedFromChunk": k[i] });
                res.shipType = this.dataKeys_ships[temp];
                continue;
            }
            if (temp >= this.dataKeys_modules.length)
                return new response_1.response(true, "decrypt-module-arr", "unknown", "invalid module index after decrypt", { "input": a, "invalidIndex": temp, "convertedFromChunk": k[i] });
            res.moduleNameArr.push(this.dataKeys_modules[temp]);
        }
        return res;
    }
    encryptGeneric(numArr) {
        let longestLength = -1;
        let a = [];
        numArr.forEach((i, index) => {
            let temp = this.base10tobaseN(i);
            if (temp instanceof response_1.response)
                return temp;
            if (temp.length > longestLength)
                longestLength = temp.length;
            a[index] = temp;
        });
        if (longestLength <= 0)
            return new response_1.response(true, "encrypt-generic", "unknown", "input empty", { "numArr": numArr });
        if (longestLength > 1) {
            for (let i = 0; i < a.length; i++) {
                a[i] = a[i].padStart(longestLength, "0"); // thank god this feature exist
            }
        }
        if (longestLength == this.defaultLotLength)
            return a.join("");
        else
            return `${longestLength}.${a.join("")}`;
    }
    decryptGeneric(a) {
        var _a;
        let lotLength = this.defaultLotLength;
        let k = a.split(".");
        if (k.length != 1 && k.length != 2)
            return new response_1.response(true, "decrypt-generic", "unknown", "input not follow expected format - too many dots (.)", { "input": a });
        if (k.length == 2) {
            lotLength = Number(k[0]);
            if (isNaN(lotLength) || lotLength < 0 || lotLength >= a.length)
                return new response_1.response(true, "decrypt-generic", "unknown", "input not follow expected format - invalid lot length", { "input": a });
        }
        let str = k[k.length - 1];
        k = (_a = this.splitStrIntoChunks(str, lotLength)) !== null && _a !== void 0 ? _a : [];
        if (!k.length)
            return new response_1.response(true, "decrypt-generic", "unknown", "failed to split input into chunks of specified size", { "input": a });
        let res = [];
        k.forEach((i, index) => {
            let temp = this.baseNtobase10(i);
            if (temp instanceof response_1.response)
                return temp;
            if (temp >= this.dataKeys_modules.length)
                return new response_1.response(true, "decrypt-generic", "unknown", "invalid module index after decrypt", { "input": a, "invalidIndex": temp, "convertedFromChunk": i });
            res[index] = temp;
        });
        return res;
    }
    booleanArrToNum(arr) {
        let res = this.baseNtobase10_temp(arr.map(i => Number(i)), 2);
        if (!res)
            return new response_1.response(true, "booleanArrToNum", "unknown", "fail to convert", { input: arr });
        return res;
    }
    numToBooleanArr(num, desiredLength) {
        let res = this.base10tobaseN_temp(num, 2);
        if (!res)
            return new response_1.response(true, "numToBooleanArr", "unknown", "fail to convert", { input: num });
        if (desiredLength <= res.length)
            return res.map(i => (i == 0) ? false : true);
        else
            return res.join("").padStart(desiredLength, "0").split("").map(i => (i == "0") ? false : true);
    }
}
let a = new cryptEngine();
exports.default = a;
