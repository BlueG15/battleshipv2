# battleshipv2
This is the code the battleship v2 server

## Definition of classes

### Response<T>
All responses by the server will be of type Response<T>, what T is depends on the event

```ts
class response<T extends Object> {
    timeStamp: string //ISO string of the time
    fail : boolean //whether the thing event succeeds or not
    event: string //event name
    player : string //name of the player who trigger the event
    note : string //event note
    data : T
}
```
### shipObject
contains ship data

```ts
class shipObj{
  pos : number[], //length = 2
  isVertical : boolean,
  modulesArr: string[], //array of module names, index correspond to the indexes of that module on the ship unraveled
  shipType : string, //shipID
}
```

### playerObject 
Uses as a T in Response, contains player data

```ts
class gameObj {
  roomID : string,
  isHost : boolean,
  name : string,
  isTurn : boolean,
  isReady : boolean,
  energy : number,
  modArr : number[],
  shipObjArray? : shipObj[],

  timePerRound : number,
  timeBonus : number
}
```


### gameObject 
Uses as a T in Response, contains game data

```ts
class gameObj {
  roomID : string
  spectatorCount : number
  mode? : number
  p1Obj? : playerObj
  p2Obj? : playerObj
  turnCount? : number
  phase? : number
}
```

## Events

Note that all outputs shown here are outputs if NOT error

### createRoom

Input :

```ts
interface createRoomInputData {
    name : string; //max length = 20
    mode : number; // 1 is the only valid mode for now
} 
```

Output :
response<gameObj>

### joinRoom

Input :

```ts
interface joinRoomInputData {
    name : string; //max length = 20
    roomID : string;
} 
```

Output :
response<gameObj>

### joinAsSpectator

Input :

```ts
interface joinAsSpectatorInputData {
    roomID : string;
} 
```

Output :
response<gameObj>

### toggleReady

Input : {}

Output :
response<T>

T : 
```ts
{
  player: 1 | 2, 
  isReady : boolean
}
```

### uploadShipData

Input : 

```ts
interface uploadShipDataInputData {
    shipData : shipObj[] //no need to be full array btw, later uploads overwrites the previous
}
```

Outputs : 
for cause : response<gameObj>
for others : response<{player : 1 | 2}>

### updateGameMetaData 

Input : 

```ts
interface updateGameMetaDataInputData {
    timeBonus? : number, //default = 0
    timePerPlayer? : number //default = 3000
} 
```
Output : 
response<gameObj>

### chat

Input : 

```ts
interface chatInputData {
    message : string
} 
```

Output : 
response<T>

T:

```ts
{
  player : string, // playerName
  playerNum: 1 | 2 | 3 | 4, // 3 or 4 means spectator
  message : string 
}
```

### getRoomData : 

Input : {}

Output : 
response<gameObj>

### disconnect-return

//server return event only
Output:
```ts
interface removeFromRoomReturnFormat extends Partial<gameObj>{
  playerRemoved : 1 | 2 | 3 | 0 // 0 means no player removes
}
```


## Usage

send an event to the server, listen to the exact same event back *
(*) : exeption being the event "disconnect", which server sends to everyone "disconnect-return"

