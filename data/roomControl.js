//const fs = require('fs');
//fs can only read, not write

const defRes = require('./responses.js')
const db = require('./dbControl.js')
const gameController = require('./gameControl.js')

let roomController = {}

roomController.bootstrap = () => new Promise(async (resolve, reject) => {
  await db.query( 
    `CREATE TABLE IF NOT EXISTS rooms (
        roomID VARCHAR(10) PRIMARY KEY,
        p1ID VARCHAR(20),
        p1Name VARCHAR(20),
        p1Ready BOOLEAN,
        p2ID VARCHAR(20),
        p2Name VARCHAR(20),
        p2Ready BOOLEAN,
        p3ID VARCHAR(20),
        p4ID VARCHAR(20)
    );`
  ); //p3 and p4 are spectators
  return resolve(0)
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
  return resolve(res[0]) //object, empty if nothing found
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
    return resolve (new defRes(true, "createRoom", playerID, `Fail to create a new room, database full, considering restarting it, rooms should NOT last this long`), {"exist": exist})
  }
  await db.query(`                                
    INSERT INTO rooms (roomID, p1ID, p1Name, p1Ready) VALUES ('${roomID}', '${playerID}', '${db.sanitizeString(playerName)}', false);
  `)
  const res = {
    'roomID' : roomID,
    'host' : true
  }
  //note to self: socket.send to playerID what this resolves
  return resolve(new defRes(false, 'createRoom', playerID, `player ${playerID} successfully created new room with roomID = ${roomID}`, res))
})

roomController.addToRoom = (playerID, playerName, roomID) => new Promise( async (resolve, reject) => {
  //only adds the 2nd player as the 1st is added on room creation
  const roomData = await roomController.getRoomData(roomID)
  if(!roomData) return resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'));
  if(roomData['p2id']) return resolve(new defRes(true, 'addToRoom', playerID, 'room full'))
  await db.transac([
    `UPDATE rooms SET p2ID = '${playerID}' WHERE roomID = '${roomID}';`,
    `UPDATE rooms SET p2Name = '${db.sanitizeString(playerName)}' WHERE roomID = '${roomID}';`,
    `UPDATE rooms SET p2Ready = false WHERE roomID = '${roomID}'`
  ])
  return resolve(new defRes(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as player 2`, {}))
}) 

roomController.addSpectator = (playerID, roomID) => new Promise( async (resolve, reject) => {
  //only adds spectators
  const roomData = await roomController.getRoomData(roomID)
  if(!roomData) return resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  if(roomData['p3id']) {

    if(!roomData['p4id']){
      await db.query(`UPDATE rooms SET p4ID = '${playerID}' WHERE roomID = '${roomID}'`)
      var player = 2  
    } else {
      //out of spectator slots
      return resolve (new defRes(true, "addSpectator", playerID, `failed to add player ${playerID} to room ${roomID} due to full spectator slots`, {}))
    }

  } else {
    await db.query(`UPDATE rooms SET p3ID = '${playerID}' WHERE roomID = '${roomID}'`)
    var player = 1
  }
  return resolve(new defRes(false, 'addToRoom', playerID, `successfully added player ${playerID} to room ${roomID} as spectator number ${player}`, {"roomData" : roomData}))
})

roomController.removeFromRoom = (playerID, roomID) => new Promise( async (resolve, reject) => {
  //note to self: invoke gameControl to delete the room table

  //if player 1 is removed, room is deleted
  var roomData = await roomController.getRoomData(roomID)
  if(!roomData) resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  switch(playerID){
  case roomData['p1id'] :  { //player is player 1

      //inform spectators that room closed
      await db.transac([
        `DELETE FROM rooms WHERE roomID = '${roomID}'`,
        `DROP TABLE IF EXISTS ${roomID}`
      ])
      return resolve(new defRes(false, 'removeFromRoom', playerID, `the host left the room, successfully deleted room ${roomID}`, {'oldRoomData' : roomData}))
    } 
  case roomData['p2id'] : {
      //player is player 2

      //note to self: inform player 1 and spectators that player 2 left after invoking this function
      await db.query(`UPDATE rooms SET p2ID = NULL WHERE roomID = '${roomID}'`)
      return resolve(new defRes(false, 'removeFromRoom', playerID, `player 2 left the room successfully in room ${roomID}`, {}))
    }
  case roomData['p3id'] : {
    //player 3 is a spectator

    if(roomData['p4id']){
      await db.transac([
        `UPDATE rooms SET p3ID = '${roomData['p4id']}' WHERE roomID = '${roomID}'`,
        `UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`
      ])
    } else {
      await db.query(`UPDATE rooms SET p3ID = NULL WHERE roomID = '${roomID}'`)
    }
    return resolve(new defRes(false, 'removeFromRoom', playerID, `spectator 1 left in room ${roomID}`, {}))
  }
  case roomData['p4id'] : {
    //player 4 is a spectator
    await db.query(`UPDATE rooms SET p4ID = NULL WHERE roomID = '${roomID}'`)
    return resolve(new defRes(false, 'removeFromRoom', playerID, `spectator 2 left in room ${roomID}`, {}))
  }
  default : {
    return resolve(new defRes(true, 'removeFromRoom', playerID, `playerID not exist in room ${roomID}`, {'roomData' : roomData}))
  }
  }
})

roomController.setReady = (playerID, roomID, isReady) => new Promise( async (resolve, reject) => {
  const roomData = await roomController.getRoomData(roomID)
  if(!roomData) resolve(new defRes(true, 'addToRoom', playerID, 'room not exist'))
  if(roomData['p1id'] == playerID){
    //player is player 1
    await db.query(`UPDATE rooms SET p1Ready = ${isReady} WHERE roomID = '${roomID}';`)
    if(isReady && roomData['p2ready']){
      //both player ready, initiate game
      await gameController.startGame(roomID)
      return resolve( new defRes(false, "setReady", playerID, `both player set status as ready in room ${roomID}, game started`) )
    }
    return resolve( new defRes(false, "setReady", playerID, `player ${playerID} successfully set ready status as ${isReady} in room ${roomID}`) )
  } else if(roomData['p2id'] == playerID){
    //player is player 2
    await db.query(`UPDATE rooms SET p2Ready = ${isReady} WHERE roomID = '${roomID}';`)
    if(isReady && roomData['p1ready']){
      //both player ready, initiate game
      await gameController.startGame(roomID)
      return resolve( new defRes(false, "setReady", playerID, `both player set status as ready in room ${roomID}, game started`) )
    }
    return resolve( new defRes(false, "setReady", playerID, `player ${playerID} successfully set ready status as ${isReady} in room ${roomID}`) )
  } else {
    //player not belong to this room
    return resolve( new defRes(true, "setReady", playerID, `player ${playerID} is not in room ${roomID}`) )
  }
})

//unsanitize method, do not leak method access to user
roomController.getRoomOfUserFromID = async (userID) => {

  if(userID){
    var a = await db.query(`
      SELECT * FROM rooms WHERE p1ID = ${userID} OR p2ID = ${userID} OR p3ID = ${userID} OR p4ID = ${userID}
    `).rows
    if(!a || !a.length){
      return {}
    }

    a = a[0]
    switch(userID){
      case a['p1id'] : {
        return {
          'roomID' : a['roomid'],
          'player' : 1,
          'name' : a['p1name'],
          'isSpectator' : false
        }
      }
      case a['p2id'] : {
        return {
          'roomID' : a['roomid'],
          'player' : 2,
          'name' : a['p2name'],
          'isSpectator' : false
        }
      }
      case a['p3id'] : {
        return {
          'roomID' : a['roomid'],
          'player' : 3,
          'name' :  null,
          'isSpectator' : true
        }
      }
      case a['p4id'] : {
        return {
          'roomID' : a['roomid'],
          'player' : 4,
          'name' :  null,
          'isSpectator' : true
        }
      }
    }

  } else {
    return {}
  }
}

module.exports = roomController