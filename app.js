const { createServer } = require("http");
const cors = require('cors')
const expressx = require("express");
const express = expressx()
express.use(expressx.json())
express.use(cors())
const roomController = require("./data/roomControl.js");
const databaseController = require("./data/dbControl.js");

// Important! Set the port using the PORT environment variable
const port = process.env.PORT ?? 3000;

const { Server } = require("socket.io");

const httpServer = createServer(express); //direct express into the http server
const io = new Server(httpServer, {
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(port, () => {
  console.log(`Socket listening on port ${port}`);
});

async function main(){
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
  
  express.get("/testLog4", async (req, res) => {
    await databaseController.deleteEarlyLogs(3)
    res.send('ok')
  })
  }
  
  //socket section
  io.on("connection", async (socket) => {
    databaseController.writeLog('general', 'noRoom', socket.id, 'unknownUser', 'new socket connected');

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
  

  await roomController.bootstrap();
  await databaseController.initializeLogTable();
}

main()