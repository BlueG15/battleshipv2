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
  express.get("/createRoom", async (req, res) => {
    let a = await roomController.createRoom(defTestPlayerID1, "P1")
    res.send(JSON.stringify(a))
  })

  express.get("/joinRoom/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.addToRoom(defTestPlayerID2, "P2", roomID)
    res.send(JSON.stringify(a))
  })

  express.get("/roomData/:roomID", async (req, res) => {
    let roomID = req.params.roomID
    let a = await roomController.getRoomData(roomID)
    res.send(JSON.stringify(a))
  })

  await roomController.bootstrap();

  express.listen(port, () => {
    console.log(`Express listening on port ${port}`);
  });
}

main()