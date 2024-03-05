const fs = require('fs')
const { createServer } = require("http");
const cors = require('cors')
const expressx = require("express");
const express = expressx()
express.use(expressx.json())
express.use(cors())

const roomController = require("./data/roomControl.js");
const databaseController = require("./data/dbControl.js");
const response = require('./data/responses.js')
const eventController = require("./public/eventSystem.js")

const events = fs.readdirSync(`./events`).map(i => {return i.split('.')[0]}) //['ping', 'createRoom', 'joinRoom', 'joinAsSpectator','setReady', 'leaveRoom']
const spectatorEvents = ['ping']

// Important! Set the port using the PORT environment variable
const port = process.env.PORT ?? 3000;

const { Server } = require("socket.io");
const { format } = require('path');

const httpServer = createServer(express); //direct express into the http server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(port, () => {
  console.log(`Socket listening on port ${port}`);
});

const testEvent = (e) => {
  return events.includes(e)
}

async function main(){

  //initializing all stuff
  await databaseController.cleanAllTablesButLogs();
  await roomController.bootstrap();
  await databaseController.initializeLogTable();
  
  express.get("/", (req, res) => {
    res.send("Hello World!");
  });
  
  const defTestPlayerID1 = new Array(20).fill("A").join("")
  const defTestPlayerID2 = new Array(20).fill("B").join("")
  const defTestPlayerID3 = new Array(20).fill("C").join("")
  const defTestPlayerID4 = new Array(20).fill("D").join("")
  
  //express endpoints use to test functions
  {
    express.get("/createRoom", async (req, res) => {
    let a = await roomController.createRoom(defTestPlayerID1, "P1")
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/joinRoom/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.addToRoom(defTestPlayerID2, "P2", roomID)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/roomData/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.getRoomData(roomID)
    res.send(JSON.stringify(a, null, 4))
  })
  
  express.get("/joinAsSpectator/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.addSpectator(defTestPlayerID3, roomID)
    res.send(JSON.stringify(a, null, 4))
  })
  
  express.get("/joinAsSpectator2/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.addSpectator(defTestPlayerID4, roomID)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/leaveRoom1/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.removeFromRoom(defTestPlayerID1, roomID)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/leaveRoom2/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.removeFromRoom(defTestPlayerID2, roomID)
    res.send(JSON.stringify(a, null, 4))
  })
  
  express.get("/leaveRoom3/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.removeFromRoom(defTestPlayerID3, roomID)
    res.send(JSON.stringify(a, null, 4))
  })
  
  express.get("/leaveRoom4/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.removeFromRoom(defTestPlayerID4, roomID)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/ready/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.setReady(defTestPlayerID1, roomID, true)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/ready1/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.setReady(defTestPlayerID2, roomID, true)
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/getLogs", async (req, res) => {
    let a = await databaseController.getAllLogs()
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/getAllTables", async (req, res) => {
    let a = await databaseController.getAllTableName()
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/testLog", async (req, res) => {
    let a = await databaseController.test()
    res.send(JSON.stringify(a, null, 4))
  })

  express.get("/testLog2", async (req, res) => {
    await databaseController.writeLog('test', 'AAAAA', 'test1AA', 'P1', 'THISISATEST')
    await databaseController.writeLog('test', 'BBBBB', 'test2BB', 'P2', 'THISISATEST')
    await databaseController.writeLog('test', 'CCCCC', 'test3CC', 'P3', 'THISISATEST')
    await databaseController.writeLog('test', 'DDDDD', 'test2DD', 'P4', 'THISISATEST')
    await databaseController.writeLog('test', 'EEEEE', 'test2EE', 'P5', 'THISISATEST')
    res.send('ok')
  })

  express.get("/testLog3", async (req, res) => {
    await databaseController.deleteEarlyLogs(3)
    res.send('ok')
  })
  }
  
  //outside the onAny event, we bootstraps the internal event system
  //do not use socket.id here, cant
  eventController.intervalID = setInterval(async () => {

    eventController.selectEventForExecution()

    if(eventController.eventsToExecute.length){

      for(var j = 0; j < eventController.eventsToExecute.length; j++){

        let i = eventController.eventsToExecute[j]

        if(i.modulo && i.modulo.length){
          //trigger module
          try{
            var load = require(`./modules/${i.modulo}.js`)
          } catch(err) {
            databaseController.writeLog('general', i['roomID'], "NULL", 'unknownPlayer', `fail to import event ${i.modulo}`)
            continue
          }

          try{
            var res = load(i)
          } catch(err) {
            databaseController.writeLog('general', i['roomID'], "NULL", 'unknownPlayer', `fail to execute event ${i.modulo}`)
            continue
          }

          i = res
        }

        //check for each type, do accordingly
        if(i.sendType == "eventOveride" && i.to && i.to.length){
          i.to.forEach(k => {
            io.to(k).emit(i.eventName, i.res)
          })
          continue
        }  

        //get room
        if(!i.roomID || !i.roomID.length) continue
        let roomData = await roomController.getRoomData(i.roomID)

        for(var l = 1; l <= 4; l++){

          switch(i.sendType) {
            case "sendToAll" : {
              io.to(roomData[`p${l}id`]).emit(i.eventName, i.res)
              break;
            }
            case "sendToPlayers" : {
              if(l == 1 || l == 2){
                io.to(roomData[`p${l}id`]).emit(i.eventName, i.res)
              }
              break;
            }
            case "sendToSpectators" : {
              if(l == 3 || l == 4){
                io.to(roomData[`p${l}id`]).emit(i.eventName, i.res)
              }
              break;
            }
            case "sendToP1" : {
              if(l == 1){
                io.to(roomData[`p1id`]).emit(i.eventName, i.res)
              }
              break;
            }
            case "sendToP2" : {
              if(l == 2){
                io.to(roomData[`p2id`]).emit(i.eventName, i.res)
              }
              break;
            }
          }

        }

      }

    }

    eventController.clearExecutedEvents()
    eventController.currentTime += eventController.timePerFrame 

  }, eventController.timePerFrame)

  //socket section
  io.on("connection", async (socket) => {
    databaseController.writeLog('general', 'noRoom', socket.id, 'unknownUser', 'new socket connected');

    // socket.on('ping', async () => {
    //   io.to(socket.id).emit('pong', 'ok')
    //   return
    // })

    socket.onAny(async (event, ...args) => {  
      //var x = JSON.parse(fs.readFileSync(`./global/server.json`))
      databaseController.writeLog('general', 'noRoom', socket.id, 'unknownUser', `new event received: ${event}`)
  
      try {
        var a = testEvent(event)
        if (!event || !a) { //unavailable events
          io.to(socket.id).emit(event, new response(true, event, socket.id, `event: '${event}' does not exist`))
          return
        }
  
        try {
          var load = require(`./events/${event}.js`)
        } catch (err) {
          console.log(err)
          io.to(socket.id).emit(event, new response(true, event, socket.id, `event: '${event}' cannot load`))
          return
        }
  
        if (!args) {
          args = {}
        }

        try {
          //right, this is the meat of the socket control system

          //this part fetches the roomObj of the player (if any)
          var x = await roomController.getRoomOfUserFromID(socket.id)
          if(x.isSpectator && !spectatorEvents.includes(event)){
            io.to(socket.id).emit(event, new response(true, event, socket.id, `spectator cannot triger this event`))
          }

          var inputObj = {
            'playerID' : socket.id,
            'oldPlayerData' : x,
            'input' : args
          }

                   
          var re = await load(inputObj);
          
          //this part refetches the roomObject if the responses doesnt have it
          if(!re['roomData']){ //get roomData if response doesnt have it
            var x = await roomController.getRoomOfUserFromID(socket.id)
            re['playerName'] = x.name
            re['roomID'] = x['roomID']
            var y = await roomController.getRoomData(re['roomID'])
            re['roomID'] = y
          }

          if(!re['roomData']['roomID']){
            //player not of any room
            //currently dont have anything since it shouls still works
            io.to(socket.id).emit("warn", "no room")
          }
          
          let event = re['globalEventOveride'] ?? event
          let event2 = "";

          //this shit looks intimidating but its just follows the same format
          //loop through all players and spectator
          //if response need to be sent, check to see if event overide
          //if it exist, change event
          //send response
          //continue
          for (var i = 1; i <= 4; i++) {

            if(re['ignore'] && re['ignore'].includes(i)) continue

            //handling overide properties
            if(re['sendToAll']) {

              if(re['roomData'][`p${i}id`] && re['roomData'][`p${i}id`] != 'NULL') {

                if(re['sendToAll']['eventOveride']) {
                  event2 = re['sendToAll']['eventOveride']
                  delete re['sendToAll']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(re['roomData'][`p${i}id`]).emit(event2, re['sendToAll'])

              }
            }

            if(re['sendToPlayers'] && (i == 1 || i == 2)) {

              if(re['roomData'][`p${i}id`] && re['roomData'][`p${i}id`] != 'NULL') {

                if(re['sendToPlayers']['eventOveride']) {
                  event2 = re['sendToPlayers']['eventOveride']
                  delete re['sendToPlayers']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(re['roomData'][`p${i}id`]).emit(event2, re['sendToPlayers'])

              }
            }

            if(re['sendToSpectators'] && (i == 3 || i == 4)) {

              if(re['roomData'][`p${i}id`] && re['roomData'][`p${i}id`] != 'NULL') {

                if(re['sendToSpectators']['eventOveride']) {
                  event2 = re['sendToSpectators']['eventOveride']
                  delete re['sendToSpectators']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(re['roomData'][`p${i}id`]).emit(event2, re['sendToSpectators'])
                
              }
            }

            if(re['sendToP1'] && (i == 1)) {

              if(re['roomData'][`p${i}id`] && re['roomData'][`p${i}id`] != 'NULL') {

                if(re['sendToP1']['eventOveride']) {
                  event2 = re['sendTo1']['eventOveride']
                  delete re['sendToP1']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(re['roomData'][`p${i}id`]).emit(event2, re['sendToP1'])

              }
            }

            if(re['sendToP2'] && (i == 2)) {

              if(re['roomData'][`p${i}id`] && re['roomData'][`p${i}id`] != 'NULL') {

                if(re['sendToP2']['eventOveride']) {
                  event2 = re['sendToP2']['eventOveride']
                  delete re['sendToP2']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(re['roomData'][`p${i}id`]).emit(event2, re['sendToP2'])

              }
            }

            if (re['roomData'][`p${i}id`] == socket.id) { //extra check to see if in room

              if(re['sendToCause']) {

                if(re['sendToCause']['eventOveride']) {
                  event2 = re['sendToCause']['eventOveride']
                  delete re['sendToCause']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(socket.id).emit(event2, re['sendToCause']);

              }
  
            } else if(i == 1 || i == 2){//the other player

              if(re['sendToOther']){

                if(re['sendToOther']['eventOveride']) {
                  event2 = re['sendToOther']['eventOveride']
                  delete re['sendToOther']['eventOveride']
                } else {
                  event2 = event
                }

                io.to(socket.id).emit(event2, re['sendToOther']);

              }

            }

            if(re['sendToCauseIgnoreCheck']){

              if(re['sendToCauseIgnoreCheck']['eventOveride']) {
                event2 = re['sendToCauseIgnoreCheck']['eventOveride']
                delete re['sendToCauseIgnoreCheck']['eventOveride']
              } else {
                event2 = event
              }

              io.to(socket.id).emit(event2, re['sendToCauseIgnoreCheck'])
              
            }

          }
  
          if(re["serverLog"]){
            databaseController.writeLog('general', re['roomID'], socket.id, re['playerName'] ?? 'unknownPlayer', re['serverLog'])
          }
          
          return
  
        } catch (err) {
          io.to(socket.id).emit(event, new response(true, event, socket.id, `failure to execute event`, {'error': String(err)}))
          return
        }
  
      } catch (err) { //try catch of the entire onAny code block
        io.to(socket.id).emit(event, new response(true, event, socket.id, `total server failure`, {'error': String(err)}))
        return
      }
    })

    socket.on("disconnect", async (err) => {
      var a = await roomController.getRoomOfUserFromID(socket.id)
      if(!a.roomID) {
        //player not in any room
        databaseController.writeLog('general', 'noRoom', socket.id, 'unknownUser', 'unknown socket disconnected');
        return
      }
      databaseController.writeLog('general', a.roomID, socket.id, a.name, `player ${a.player} disconnected`);
      await roomController.removeFromRoom(socket.id, a.roomID)
    });

  });
  
  
}

main()