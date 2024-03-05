const eventController = require(`../public/eventSystem.js`)

module.exports = (inputObj) => {
    eventController.addEvent(eventController.currentTime + 5 * eventController.timePerFrame, "", "sendOveride", "pong", {}, "repeatedPong", [inputObj.playerID])
    return {
        'sendToCauseIgnoreCheck' : "pong",
        'globalEventOveride' : "pong"
    }
}