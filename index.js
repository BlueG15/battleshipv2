"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const universalModuleInput_1 = require("./utils/classes/universalModuleInput");
const response_1 = require("./utils/classes/response");
//pg system
//import { default as db } from "./dataControl/dbControl"
const dbControl_1 = require("./dataControl/dbControl");
const roomControl_1 = require("./dataControl/roomControl");
const gameControl_1 = require("./dataControl/gameControl");
//event system
const eventControl_1 = require("./eventSystem/eventControl");
//initialization code, server startup and whatnot
//note to self: change allowEvents array to also be dynamic through fs readDirSync
const allowEvents = ["ping", "pingStop"];
const spectatorEvents = [];
const testEvents = ["ping", "pingStop"];
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express = (0, express_1.default)();
express.use(express_1.default.json());
express.use((0, cors_1.default)());
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
const socket_io_1 = require("socket.io");
const httpServer = (0, http_1.createServer)(express); //direct express into the http server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
httpServer.listen(port, () => {
    console.log(`Socket listening on port ${port}`);
});
function testAllowEvent(e) {
    return allowEvents.includes(e);
}
function testSpectatorEvents(e) {
    return spectatorEvents.includes(e);
}
function testTestEvent(e) {
    return testEvents.includes(e);
}
function setUpExpressEndpoints() {
    express.get("/", (req, res) => {
        res.send("Hello World!");
    });
    //there may be more stuff but only this for now
}
async function main() {
    //setup
    setUpExpressEndpoints();
    let db = new dbControl_1.databaseController();
    let game = new gameControl_1.gameController(db);
    let room = new roomControl_1.roomController(db);
    //commented out due to not needed
    //await game.defineType
    //await db.initializeLogTable()
    //await room.init();
    async function loadModule(e, input) {
        //ok, brace self for try catch tower
        let load = undefined;
        try {
            load = await Promise.resolve(`${`./module/${e}.js`}`).then(s => __importStar(require(s)));
            load = load.default;
        }
        catch (err) {
            return new response_1.response(true, e, "unknownPlayer", "cannot load module", {
                fullError: err.toString()
            });
        }
        let res = undefined;
        try {
            res = await load(input);
        }
        catch (err) {
            return new response_1.response(true, e, "unknownPlayer", "cannot run module", {
                fullError: err.toString()
            });
        }
        return res;
    }
    async function handleModuleRes(input, output) {
        var _a, _b, _c, _d;
        let k = input.cause;
        if (!k)
            k = {};
        if (output.serverLog) {
            await db.writeLog("moduleLog", (_a = k.roomID) !== null && _a !== void 0 ? _a : undefined, (_b = k.playerID) !== null && _b !== void 0 ? _b : undefined, (_c = k.name) !== null && _c !== void 0 ? _c : undefined, JSON.stringify(output.serverLog));
        }
        if (!k.playerID)
            return;
        if (output.sendToCauseIgnoreCheck) {
            let e = (_d = output.eventOveride) !== null && _d !== void 0 ? _d : input.event;
            if (e) {
                io.to(k.playerID).emit(e, output.sendToCauseIgnoreCheck);
            }
        }
        //check if player is in anyroom at all
        //ignore check means ignore this check
        if (!k.roomID || !k.roomData || !input.event || !k.player || k.player < 0)
            return;
        //relative sends
        if (output.sendToCause) {
            io.to(k.playerID).emit(input.event, output.sendToCause);
        }
        if (output.sendToOther) {
            switch (k.player) {
                case 1: {
                    const t = k.roomData.p2id;
                    if (!t)
                        break;
                    io.to(t).emit(input.event, output.sendToOther);
                    break;
                }
                case 2: {
                    io.to(k.playerID).emit(input.event, output.sendToOther);
                    break;
                }
                default: break;
            }
        }
        //not relative sends
        //gosh this looks terrible
        //but like, this is very easy to explain what the code does
        const [p1id, p2id, p3id, p4id] = [
            k.roomData.p1id,
            k.roomData.p2id,
            k.roomData.p3id,
            k.roomData.p4id
        ];
        if (p1id) {
            if (output.sendToP1)
                io.to(p1id).emit(input.event, output.sendToP1);
            if (output.sendToPlayers)
                io.to(p1id).emit(input.event, output.sendToPlayers);
            if (output.sendToAll)
                io.to(p1id).emit(input.event, output.sendToAll);
        }
        if (p2id) {
            if (output.sendToP2)
                io.to(p2id).emit(input.event, output.sendToP2);
            if (output.sendToPlayers)
                io.to(p2id).emit(input.event, output.sendToPlayers);
            if (output.sendToAll)
                io.to(p2id).emit(input.event, output.sendToAll);
        }
        if (p3id) {
            if (output.sendToP3)
                io.to(p3id).emit(input.event, output.sendToP3);
            if (output.sendToSpectators)
                io.to(p3id).emit(input.event, output.sendToPlayers);
            if (output.sendToAll)
                io.to(p3id).emit(input.event, output.sendToAll);
        }
        if (p4id) {
            if (output.sendToP4)
                io.to(p4id).emit(input.event, output.sendToP4);
            if (output.sendToSpectators)
                io.to(p4id).emit(input.event, output.sendToPlayers);
            if (output.sendToAll)
                io.to(p4id).emit(input.event, output.sendToAll);
        }
    }
    async function intervalLoop() {
        let eArr = eventControl_1.eControl.incrementTime();
        if (eArr && eArr.length) {
            for (let j = 0; j < eArr.length; j++) {
                let i = eArr[j];
                if (i.moduleName && i.moduleName.length) {
                    let res = await loadModule(i.moduleName, i.data);
                    if (!res)
                        continue;
                    if (res instanceof response_1.response) {
                        db.writeLog(res.event, undefined, res.player, undefined, JSON.stringify(res));
                        continue;
                    }
                    await handleModuleRes(i.data, res);
                }
            }
        }
    }
    //initialize event loop
    eventControl_1.eControl.intervalID = setInterval(intervalLoop, eventControl_1.eControl.timePerFrame);
    //socket section
    io.on("connection", async (socket) => {
        db.writeLog('general', 'noRoom', socket.id, 'unknownUser', 'new socket connected');
        socket.on("disconnect", async (reason) => {
            eventControl_1.eControl.removeAllEventsAddedByAPlayer(socket.id);
        });
        // https://socket.io/docs/v4/server-api/#socketonanycallback
        socket.onAny(async (event, ...args) => {
            if (!testAllowEvent(event))
                return;
            let playerData = await room.getRoomOfUserFromID(socket.id);
            if (!playerData)
                return;
            if (!playerData.roomID) {
                let emptyParam = new universalModuleInput_1.moduleInput(playerData, event, undefined);
                //player is not in any roomat are exclusively for testing
                if (!testTestEvent(event))
                    return;
                //is test event, execute
                let res = await loadModule(event, emptyParam);
                if (!res)
                    return;
                if (res instanceof response_1.response) {
                    io.to(socket.id).emit(event, res);
                }
                else {
                    await handleModuleRes(emptyParam, res);
                }
                //only handle unit events th
                return;
            }
            ;
            let k = undefined;
            if (args && args[0])
                k = args[0];
            else
                k = {};
            let param = new universalModuleInput_1.moduleInput(playerData, event, k);
            let res = await loadModule(event, param);
            if (!res)
                return;
            if (res instanceof response_1.response) {
                io.to(socket.id).emit(event, res);
            }
            else {
                await handleModuleRes(param, res);
            }
        });
    });
}
main();
