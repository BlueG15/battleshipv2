//const fs = require('fs');
const defRes = require('./responses.js')
const db = require('./dbControl.js')
//fs can only read, not write

let roomController = {}

roomController.bootstrap = () => new Promise(async (resolve, reject) => {
  await db.transac([
    `DROP TABLE IF EXISTS rooms;`,
    `CREATE TABLE IF NOT EXISTS rooms (
        roomID VARCHAR(10) PRIMARY KEY,
        p1ID VARCHAR(20),
        p1Name VARCHAR(16),
        p2ID VARCHAR(20),
        p2Name VARCHAR(16),
        p3ID VARCHAR(20),
        p4ID VARCHAR(20)
    );`
  ]); //p3 and p4 are spectators
  resolve(0)
})

function rng(min, max, round){
  if (max < min) {
    [max, min] = [min, max]; // Swap values if max is less than min
  }
  return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}

function generateRandomID(length = 6) {
  length = Number(length);
  if (isNaN(length) || length <= 0) {
    length = 12;
  }

  const characters =
    'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'; //removed I, i, L, l, 0, O and o to avoid confusion
  var randomMap = new Array(length)
  for (let i = 0; i < length; i++) {
    randomMap[i] = (i == 0) ? rng(0, characters.length - 10, true) : rng(0, characters.length - 1, true)
  }
  const charArr = [];

  for (let i = 0; i < length; i++) {
    const index = randomMap[i];
    charArr.push(characters[index % characters.length]);
  }

  return charArr.join('');
}

roomController.getRoomData = (roomID) => new Promise( async (resolve, reject) => {
  const res = await db.query(`SELECT * FROM rooms WHERE roomID = '${roomID}'`)
  resolve(res) //array, empty if nothing found
})

roomController.createRoom = (playerID, playerName) => new Promise( async (resolve, reject) => {
  const exist = await db.query(`SELECT roomID FROM rooms`)
  let len = 5
  let roomID = generateRandomID(5)
  let count = 0
  while (exist.includes(roomID) && count < 300){
    roomID = generateRandomID(len)
    len += Math.floor(count / 50)
    count++
  }
  if(exist.includes(roomID)){
    //fail to create room, data base full
    resolve (new defRes(true, "createRoom", playerID, `Fail to create a new room, database full, considering restarting it, rooms should NOT last this long`), {"exist": exist})
  }
  await db.query(`                                
    INSERT INTO rooms (roomID, p1ID, p1Name) VALUES ('${roomID}', '${playerID}', '${playerName}');
  `)
  const res = {
    'roomID' : roomID,
    'host' : true
  }
  //note to self: socket.send to playerID what this resolves
  resolve(new defRes(false, 'createRoom', playerID, `player ${playerID} successfully created new room with roomID = ${roomID}`, res))
})

roomController.addToRoom = (playerID, playerName, roomID) => new Promise( async (resolve, reject) => {
  //only adds the 2nd player as the 1st is added on room creation
  const roomData = await roomController.getRoomData(roomID)
  if(!roomData.length) resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  if(roomData[2]) resolve(new defRes(true, 'addToRoom', playerID, 'room full'))
  await db.transac([
    `UPDATE rooms SET p2ID = '${playerID}' WHERE roomID = '${roomID}';`,
    `UPDATE rooms SET p2Name = '${playerName}' WHERE roomID = '${roomID}';`
  ])
  resolve(new defRes(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as player 2`, {}))
}) 

roomController.addSpectator = (playerID, roomID) => new Promise( async (resolve, reject) => {
  //only adds spectators
  const roomData = await roomController.getRoomData(roomID)
  if(!roomData.length) resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  if(roomData[3]) {
    await db.query(`UPDATE rooms SET p4ID = '${playerID}' WHERE roomID = '${roomID}'`)
    var player = 2  
  } else {
    await db.query(`UPDATE rooms SET p3ID = '${playerID}' WHERE roomID = '${roomID}'`)
    var player = 1
  }
  resolve(new defRes(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as spectator number ${player}`, {}))
})

roomController.removeFromRoom = (playerID, roomID) => new Promise( async (resolve, reject) => {
  //note to self: invoke gameControl to delete the room table

  //if player 1 is removed, room is deleted
  var roomData = await roomController.getRoomData(roomID)
  if(!roomData.length) resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  switch(playerID){
  case roomData[1] :  { //player is player 1

      //inform spectators that room closed
      await db.transac([
        `DELETE FROM rooms WHERE roomID = '${roomID}'`,
        `DROP TABLE IF EXISTS ${roomID}`
      ])
      resolve(new defRes(false, 'removeFromRoom', playerID, `the host left the room, successfully deleted room ${roomID}`, {'oldRoomData' : roomData}))
      break;
    } 
  case roomData[2] : {
      //player is player 2

      //note to self: inform player 1 and spectators that player 2 left after invoking this function
      await db.query(`UPDATE rooms SET p2ID = NULL WHERE roomID = '${roomID}'`)
      resolve(new defRes(false, 'removeFromRoom', playerID, `player 2 left the room successfully in room ${roomID}`, {}))
      break;
    }
  case roomData[3] : {
    //player 3 is a spectator
    //move player 4 into player 1 if player 4 exist

    if(roomData[4]){
      await db.transac([
        `UPDATE rooms SET p3ID = '${roomData[4]}' WHERE roomID = '${roomID}'`,
        `UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`
      ])
    } else {
      await db.query(`UPDATE rooms SET p3ID = NULL WHERE roomID = '${roomID}'`)
    }
    resolve(new defRes(false, 'removeFromRoom', playerID, `spectator 1 left in room ${roomID}`, {}))
    break;
  }
  case roomData[4] : {
    //player 4 is a spectator
    await db.query(`UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`)
    resolve(new defRes(false, 'removeFromRoom', playerID, `spectator 2 left in room ${roomID}`, {}))
    break;
  }
  default : {
    resolve(new defRes(true, 'removeFromRoom', playerID, `playerID not exist in room ${roomID}`, {'roomData' : roomData}))
    break;
  }
  }
})

module.exports = roomController