"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.e = exports.eventController = void 0;
const universalModuleInput_1 = require("../utils/classes/universalModuleInput");
class e {
    constructor(moduleName, activationTime, data) {
        this.moduleName = moduleName;
        this.activationTime = activationTime;
        this.data = data !== null && data !== void 0 ? data : new universalModuleInput_1.moduleInput();
    }
}
exports.e = e;
class eventController {
    constructor() {
        this.events = [];
        this.currentTime = 0;
        this.framerate = 8;
        this.timePerFrame = 1000 / this.framerate;
    }
    addEvent(e) {
        this.events.push(e);
        this.events = this.events.filter((a) => { return a.activationTime >= this.currentTime; }); //remove everything that is supposed to trigger in the past
        this.events.sort((a, b) => { return a.activationTime - b.activationTime; }); //sort the array from smallest to biggest
    }
    deleteEvent(indexToDelete) {
        //written as a precaution, shouldnt have to use this shit
        this.events = this.events.filter((a, index) => { return index != indexToDelete; });
    }
    selectEventForExecution() {
        //push all to be executed events to a separate property
        //the reason we cant execute these events right here is cause it involves socket stuff, 
        //and all socket stuff resides in the main js file....cause i said so
        let res = [];
        while (this.events[0].activationTime && this.events[0].activationTime <= this.currentTime) {
            var a = this.events.shift();
            if (!a)
                break;
            res.push(a);
        }
        return res;
    }
    clearInterval() {
        if (!this.intervalID)
            return;
        clearInterval(this.intervalID);
    }
}
exports.eventController = eventController;
