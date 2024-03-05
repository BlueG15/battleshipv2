const eventController = require(`../public/eventSystem.js`)

module.exports = (event) => {
    eventController.addEvent(event.triggerTime + 5 * eventController.timePerFrame, "", "sendOveride", "pong", {}, "repeatedPong", event.to)
    return event
}

