const cors = require('cors')
const expressx = require("express");
const express = expressx()
express.use(expressx.json())
express.use(cors())
const roomController = require("./data/roomControl.js");

async function main(){
  // Important! Set the port using the PORT environment variable
  const port = process.env.PORT ?? 3000;

  express.get("/", (req, res) => {
    res.send("Hello World!");
  });

  const defTestPlayerID1 = new Array(20).fill("A").join("")
  const defTestPlayerID2 = new Array(20).fill("B").join("")
  const defTestPlayerID3 = new Array(20).fill("C").join("")
  const defTestPlayerID4 = new Array(20).fill("D").join("")
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

  await roomController.bootstrap();

  express.listen(port, () => {
    console.log(`Express listening on port ${port}`);
  });
}

main()