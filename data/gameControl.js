const db = require("./dbControl.js");
//const fs = require("fs");
const defRes = require("./responses.js")
//fs can only read, not write

class shipObj {
  constructor(shipID, pos, rot){
    self.shipID = shipID ?? "NULL" //string length 10
    self.pos = (pos && pos.length == 2) ? pos : [-1, -1]//array of int
    self.rot = rot ?? -1//int
  }

  convertToSQL(){
    return `ROW('${self.shipID}', ARRAY[${self.pos.join(", ")}], ${self.rot}),`
  }
}

class playerObj {
  constructor(isTurn, energy, shipObjArray){
    self.isTurn = isTurn ?? false //boolean
    self.energy = energy ?? -1 //int
    self.shipObjArray = shipObjArray ?? new shipObj() //ship object
  }

  convertToSQL() {
    return `
    ${self.isTurn},
    ${self.energy},
    ARRAY[
      ${shipObjArray.map(i => i.convertToSQL()).join(" \n")}
    ]::SHIPOBJ[]);
    `
  }
}

class gameObj {
  constructor(roomID, mode, p1Obj, p2Obj, turnCount, phase){
    self.roomID = roomID ?? "NULL", //string length 6
    self.mode = mode ?? -1, //INT
    self.p1Obj = p1Obj ?? new playerObj() //player object
    self.p2Obj = p2Obj ?? new playerObj()//player object
    self.turnCount = turnCount ?? -1 //INT
    self.phase = phase ?? -1 //INT
  }
    
  convertToSQL() {return `
    '${self.roomID ?? ""}',
    ${self.mode ?? -1},
    ${self.p1Obj.convertToSQL()}::PLAYEROBJ,
    ${self.p2Obj.convertToSQL()}::PLAYEROBJ,
    ${self.turnCount},
    ${self.phase}
  `}
} 

let gammeController = {}

gameController.startGame = (roomID) => new Promise(async (resolve, reject) => {
    await db.transac([ 
        `CREATE TYPE SHIPOBJ AS (
          shipID : VARCHAR(10),
          pos : SMALLINT[2],
          rot : SMALLINT,
        )`,
      
        `CREATE TYPE PLAYEROBJ AS (
          isTurn : BOOLEAN,
          energy : SMALLINT,
          shipObj : SHIPOBJ[5],
        )`,

        `CREATE TABLE ${roomID} (
          roomID : VARCHAR(7) PRIMARY KEY,
          mode : SMALLINT,
          p1Obj : PLAYEROBJ,
          p2Obj : PLAYEROBJ,
          turnCount : SMALLINT,
          phase : SMALLINT,
        )`,

        `INSERT INTO ${roomID} (roomID, mode, p1Obj, p2Obj, turnCount, phase)
        VALUES (
            ${new gameObj(roomID, undefined, new playerObj(), new playerObj(), undefined, undefined).convertToSQL()}
        )`
    ]); 
    resolve(0)
})

gameController.updatePlayer = async (playerID, isTurn, energy, shipObjArray) => {
  //id is playerID
  //check if exist
  let roomID = await db.query(`SELECT roomID FROM rooms WHERE p1ID = ${playerID} OR p2ID = ${playerID}`) 
  if(!roomID || !roomID.length){
    //id invalid or player not in any rooms
    return new defRes(true, "updatePlayer", playerID, `fail to find player ${playerID} in any rooms`, {})
  }
  roomID = await db.query(`SELECT roomID FROM ${roomID}`)
  if(!roomID || !roomID.length){
    //room not exist
    return new defRes(true, "updatePlayer", playerID, `fail to locate room ${roomID} files`, {})
  }
  //check p1 or p2
  let player = await db.query(`SELECT roomID FROM rooms WHERE p1ID = ${playerID}`)
  if(!player || !player.length) player = 2; else player = 1 
  await db.query(`UPDATE ${roomID} SET p${player}Obj = ${new playerObj(isTurn, energy, shipObjArray).convertToSQL()} WHERE roomID = ${roomID}`)
}