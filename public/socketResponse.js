const socketResTemplate = {
    "ignore" : [], //arrays of soket ids that the loop will bypass, nothing will be sent to these ids

    "sendToCause" : {}, //send to the player who caused the event
    "sendToOther" : {}, //send to the player who did NOT caused the event
    "sendToCauseIgnoreCheck" : {}, //trigger anyway ignore the isPlayerInRoom check, normally used testing

    //here are the non relative events
    "sendToAll" : {},
    "sendToPlayers" : {},
    "sendToSpectators" : {},
    "sendToP1" : {},
    "sendToP2" : {},

    //ultilities
    "serverLog" : {}, //logging to database
    "globalEventOveride" : "" // overide the return event, if empty, its always the input event
}

class socketResponse {
    constructor(...args){
        
    }
}

//most objects except serverLog can have the property eventOveride, which overides the return event for that object only
