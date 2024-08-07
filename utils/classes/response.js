"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
class response {
    constructor(fail, event, player, note, data) {
        var time = new Date().toISOString();
        switch (fail) {
            case false: {
                console.log(note);
                this.fail = false;
                this.note = note;
                this.event = event;
                this.player = player;
                this.timeStamp = time;
                this.data = data !== null && data !== void 0 ? data : {};
                break;
            }
            default: {
                console.log(`player ${player} caused an error: ${note} on ${time} in event ${event}`);
                this.player = player;
                this.fail = true;
                this.note = note;
                this.event = event;
                this.timeStamp = time;
                this.data = data !== null && data !== void 0 ? data : {};
            }
        }
    }
}
exports.response = response;
