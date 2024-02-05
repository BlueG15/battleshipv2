const response = require('../data/responses.js')

module.exports = async (inputObj) => {
    return {
        'sendToCause' : new response(false, 'chat', inputObj.playerID, `successfully sent chat`),
        'sendToOther' : {
            'message' : inputObj.input.message,
            'from' : inputObj.oldPlayerData.name
        },
        'sendToSpectators' : {
            'message' : inputObj.input.message,
            'from' : inputObj.oldPlayerData.name
        }
    }
}