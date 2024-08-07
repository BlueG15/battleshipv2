"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntPosition = exports.Position = void 0;
class Position {
    constructor(param1, param2) {
        if (param2 && typeof param1 == "number") {
            this.x = param1;
            this.y = param2;
            return;
        }
        else if (typeof param1 == "object") {
            this.x = param1[0];
            this.y = param1[1];
        }
        else {
            this.x = 0;
            this.y = 0;
        }
        if (Number.isNaN(this.x) || !Number.isFinite(this.x) || !this.x)
            this.x = 0;
        if (Number.isNaN(this.y) || !Number.isFinite(this.y) || !this.y)
            this.y = 0;
    }
    toString() {
        return `[${this.x},${this.y}]`;
    }
}
exports.Position = Position;
class IntPosition extends Position {
    constructor(param1, param2) {
        if (param2 && typeof param1 == "number") {
            super(Math.round(param1), Math.round(param2));
            return;
        }
        else if (typeof param1 == "object") {
            super(Math.round(param1[0]), Math.round(param1[1]));
        }
        else {
            super(0, 0);
        }
        if (!Number.isInteger(this.x))
            this.x = 0;
        if (!Number.isInteger(this.y))
            this.y = 0;
    }
}
exports.IntPosition = IntPosition;
