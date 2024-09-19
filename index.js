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
const util_1 = __importDefault(require("util"));
const universalModuleInput_1 = require("./utils/classes/universalModuleInput");
const universalModuleRes_1 = require("./utils/classes/universalModuleRes");
const response_1 = require("./utils/classes/response");
//pg system
//import { default as db } from "./dataControl/dbControl"
const dbControl_1 = require("./dataControl/dbControl");
const newRoomControl_1 = require("./dataControl/newRoomControl");
//event system
const eventControl_1 = require("./eventSystem/eventControl");
//initialization code, server startup and whatnot
//note to self: change allowEvents array to also be dynamic through fs readDirSync
const allowEvents = ["ping", "pingStop", "createRoom", "joinRoom", "uploadShipData"];
const spectatorEvents = [];
const testEvents = ["ping", "pingStop", "createRoom", "joinRoom"];
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
    db.connect();
    let roomdb = new newRoomControl_1.roomController(db);
    let eventdb = new eventControl_1.eventController();
    async function loadModule(e, input) {
        //ok, brace self for try catch tower
        let preload = undefined;
        let load = undefined;
        try {
            preload = await Promise.resolve(`${`./module/${e}.js`}`).then(s => __importStar(require(s)));
            load = preload.default;
        }
        catch (err) {
            if (err instanceof response_1.response) {
                err.fixAndAppendData(e, ` cannot load module ${e}`);
                return err;
            }
            return new response_1.response(true, e, "unknownPlayer", "cannot load module", {
                fullError: util_1.default.format(err)
            });
        }
        let res = undefined;
        try {
            res = await load(input, roomdb, eventdb);
        }
        catch (err) {
            return new response_1.response(true, e, "unknownPlayer", "cannot run module", {
                fullError: util_1.default.format(err)
            });
        }
        return res;
    }
    async function handleEmit(event, toWhere, emitWhat) {
        try {
            io.to(toWhere).emit(event, emitWhat);
            return;
        }
        catch (err) {
            event += "-return";
            try {
                io.to(toWhere).emit(event, emitWhat);
                return;
            }
            catch (err) {
                await db.writeLog("handleEmit", "unknown", "unknown", "unknown", `CRITICAL SERVER FAILURE - cannot emit, data : ${util_1.default.format({
                    event: event,
                    toWhere: toWhere,
                    emitWhat: util_1.default.format(emitWhat),
                    fullError: util_1.default.format(err)
                })}`);
            }
        }
    }
    async function handleModuleRes(input, output) {
        //to do: fix the bug where input.event is not emittable
        //like "disconnect"
        //fixxed, allocate all emits to handleEmit function
        var _a, _b, _c, _d;
        let e = (_a = output.eventOveride) !== null && _a !== void 0 ? _a : input.event;
        if (!e) {
            await db.writeLog("handleModuleRes", "unknown", "unknown", "unknown", `CRITICAL SERVER FAILURE - input.event is somehow empty}`);
            return;
        }
        let k = input.cause;
        if (!k)
            k = {};
        if (output.serverLog) {
            await db.writeLog("moduleLog", (_b = k.roomID) !== null && _b !== void 0 ? _b : undefined, (_c = k.playerID) !== null && _c !== void 0 ? _c : undefined, (_d = k.name) !== null && _d !== void 0 ? _d : undefined, JSON.stringify(output.serverLog));
        }
        if (!k.playerID)
            return;
        if (output.sendToCauseIgnoreCheck) {
            //io.to(k.playerID).emit(e  , output.sendToCauseIgnoreCheck)
            await handleEmit(e, k.playerID, output.sendToCauseIgnoreCheck);
        }
        //check if player is in anyroom at all
        //ignore check means ignore this check
        if (!k.roomID || !k.roomData || !input.event || !k.player || k.player < 0)
            return;
        //relative sends
        if (output.sendToCause) {
            //io.to(k.playerID).emit(input.event, output.sendToCause);
            await handleEmit(e, k.playerID, output.sendToCause);
        }
        if (output.sendToOther) {
            switch (k.player) {
                case 1: {
                    const t = k.roomData.p2id;
                    if (!t)
                        break;
                    //io.to(t).emit(input.event, output.sendToOther);
                    await handleEmit(e, t, output.sendToOther);
                    break;
                }
                case 2: {
                    //io.to(k.playerID).emit(input.event, output.sendToOther);
                    const t = k.roomData.p1id;
                    if (!t)
                        break;
                    await handleEmit(e, t, output.sendToOther);
                    break;
                }
                default: break;
            }
        }
        //not relative sends
        //rewritten to be less terrible
        for (let i = 1; i <= 4; i = i + 1) {
            let pxID = k.roomData[`p${i}id`];
            if (pxID) {
                if (output[`sendToP${i}`]) //io.to(pxID).emit(input.event, output.sendToP1);
                    await handleEmit(e, pxID, output[`sendToP${i}`]);
                if (output.sendToPlayers && (i == 1 || i == 2)) //io.to(pxID).emit(input.event, output.sendToPlayers);
                    await handleEmit(e, pxID, output.sendToPlayers);
                if (output.sendToSpectators && (i == 3 || i == 4)) //io.to(p3id).emit(input.event, output.sendToPlayers);
                    await handleEmit(e, pxID, output.sendToSpectators);
                if (output.sendToAll) //io.to(pxID).emit(input.event, output.sendToAll);
                    await handleEmit(e, pxID, output.sendToAll);
            }
        }
        /*
        const [p1id, p2id, p3id, p4id] = [
          k.roomData.p1id,
          k.roomData.p2id,
          k.roomData.p3id,
          k.roomData.p4id
        ];
    
        if (p1id) {
          if (output.sendToP1)          io.to(p1id).emit(input.event, output.sendToP1);
          if (output.sendToPlayers)     io.to(p1id).emit(input.event, output.sendToPlayers);
          if (output.sendToAll)         io.to(p1id).emit(input.event, output.sendToAll);
        }
    
        if (p2id) {
          if (output.sendToP2)          io.to(p2id).emit(input.event, output.sendToP2);
          if (output.sendToPlayers)     io.to(p2id).emit(input.event, output.sendToPlayers);
          if (output.sendToAll)         io.to(p2id).emit(input.event, output.sendToAll);
        }
    
        if (p3id) {
          if (output.sendToP3)          io.to(p3id).emit(input.event, output.sendToP3);
          if (output.sendToSpectators)  io.to(p3id).emit(input.event, output.sendToPlayers);
          if (output.sendToAll)         io.to(p3id).emit(input.event, output.sendToAll);
        }
    
        if (p4id) {
          if (output.sendToP4)          io.to(p4id).emit(input.event, output.sendToP4);
          if (output.sendToSpectators)  io.to(p4id).emit(input.event, output.sendToPlayers);
          if (output.sendToAll)         io.to(p4id).emit(input.event, output.sendToAll);
        }
        */
    }
    async function intervalLoop() {
        let eArr = eventdb.incrementTime();
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
    eventdb.intervalID = setInterval(intervalLoop, eventdb.timePerFrame);
    //socket section
    io.on("connection", async (socket) => {
        db.writeLog('general', 'noRoom', socket.id, 'unknownUser', 'new socket connected');
        socket.on("disconnect", async (reason) => {
            eventdb.removeAllEventsAddedByAPlayer(socket.id);
            let playerData = await roomdb.getRoomOfUserFromID(socket.id);
            if (!playerData || !playerData.roomID)
                return;
            let x = await roomdb.removeFromRoom(playerData.roomID, socket.id);
            let emptyParam = new universalModuleInput_1.moduleInput(playerData, "disconnect", undefined);
            let res = new universalModuleRes_1.moduleRes(`socket ${socket.id} disconnected`, undefined, undefined, undefined, undefined, x);
            await handleModuleRes(emptyParam, res);
        });
        // https://socket.io/docs/v4/server-api/#socketonanycallback
        socket.onAny(async (event, ...args) => {
            if (!testAllowEvent(event))
                return;
            let playerData = await roomdb.getRoomOfUserFromID(socket.id);
            if (!playerData)
                return;
            let emptyParam = new universalModuleInput_1.moduleInput(playerData, event, undefined);
            async function parseArgs(...args) {
                let k = undefined;
                if (args && args[0] && args[0][0]) {
                    k = args[0][0];
                    try {
                        //console.log(`input : `, args)
                        k = JSON.parse(k);
                    }
                    catch (err) {
                        let res = new universalModuleRes_1.moduleRes(undefined, undefined, undefined, undefined, new response_1.response(true, event, (playerData && playerData.name) ? playerData.name : "unknown", `failed to parse input`, { input: args }));
                        return res;
                    }
                }
                else
                    k = {};
                return k;
            }
            if (!playerData.roomID) {
                let k = await parseArgs(args);
                if (k instanceof universalModuleRes_1.moduleRes) {
                    await handleModuleRes(emptyParam, k);
                    return;
                }
                let param = emptyParam;
                if (k)
                    param = new universalModuleInput_1.moduleInput(playerData, event, k);
                //player is not in any room, trigger exclusively testing events
                if (!testTestEvent(event))
                    return;
                //is test event, execute
                let res = await loadModule(event, param);
                if (!res)
                    return;
                if (res instanceof response_1.response) {
                    io.to(socket.id).emit(event, res);
                }
                else {
                    await handleModuleRes(param, res);
                }
                return;
            }
            ;
            if (testTestEvent(event))
                return; //past this point cannot trigger test events
            let k = await parseArgs(args);
            if (k instanceof universalModuleRes_1.moduleRes) {
                await handleModuleRes(emptyParam, k);
                return;
            }
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
