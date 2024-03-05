var globalEventTracker = {}
globalEventTracker.intervalID = ""
globalEventTracker.eventsToExecute = [] //the events designated to execute in the next frame
globalEventTracker.currentTime = 0 //think of this as a frame counter
globalEventTracker.events = []
globalEventTracker.frameRate = 8
globalEventTracker.timePerFrame = 1000 / globalEventTracker.frameRate

class e  { //e for event cause vs keeps telling me event is deprecated
    constructor(triggerTime, roomID, sendType, eventName, res, modulo, to = []){
        self.triggerTime = triggerTime //uses internal counter
        self.roomID = roomID //roomID
        self.sendType = sendType //type of send, see below
        self.eventName = eventName //returning event name
        self.res = res //response object
        if(e.sendType == "sendOveride" && self.to && self.to.length){
            self.to = to //array of addresses require for sendOveride
        } else {
            self.to = []
        }
        if(modulo && modulo.length){
            self.modulo = modulo //module to trigger at time of event resolution, string
        }
    }   
}

//sendOveride requires e.to to exist
const allowSendType = ["sendOveride", "sendToAll" ,"sendToPlayers", "sendToSpectators", "sendToP1", "sendToP2"]

globalEventTracker.addEvent = (triggerTime, roomID, sendType, eventName, res, modulo, to) => {
    var a = new e(triggerTime, roomID, sendType, eventName, res, modulo, to)
    globalEventTracker.events.push(a)
    .filter((a) => {return a.triggerTime >= currentTime}) //remove everything that is supposed to trigger in the past
    .sort((a, b) => {return a.triggerTime - b.triggerTime}) //sort the array from smallest to biggest
}

globalEventTracker.deleteEvent = (indexToDelete) =>  {
    //written as a precaution, shouldnt have to use this shit
    globalEventTracker.events.filter((a, index) => {return index != indexToDelete})
}

globalEventTracker.selectEventForExecution = () => {
    //push all to be executed events to a separate property
    //the reason we cant execute these events right here is cause it involves socket stuff, 
    //and all socket stuff resides in the main js file....cause i said so

    while(globalEventTracker.events[0].triggerTime <= globalEventTracker.currentTime){
        var a = globalEventTracker.events.shift()
        globalEventTracker.eventsToExecute.push(a)
    }
}

globalEventTracker.clearExecutedEvents = () => {
    globalEventTracker.eventsToExecute = []
}

globalEventTracker.clearInterval = () => {
    clearInterval(globalEventTracker.intervalID)
}

module.exports = globalEventTracker
