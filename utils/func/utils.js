"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class utils {
    rng(min, max, round) {
        if (max < min) {
            [max, min] = [min, max]; // Swap values if max is less than min
        }
        return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min;
    }
    generateRandomID(length = 12) {
        length = Number(length);
        if (isNaN(length) || length <= 0) {
            length = 12;
        }
        const characters = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'; //removed I, i, L, l, 0, O and o to avoid confusion
        var randomMap = new Array(length);
        for (let i = 0; i < length; i++) {
            randomMap[i] = (i == 0) ? this.rng(0, characters.length - 10, true) : this.rng(0, characters.length - 1, true);
        }
        const charArr = [];
        for (let i = 0; i < length; i++) {
            const index = randomMap[i];
            charArr.push(characters[index % characters.length]);
        }
        return charArr.join('');
    }
}
let a = new utils();
exports.default = a;
