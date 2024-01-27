class response  {
    constructor(fail, event, player, note, data){
        var time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                self.fail = false
                self.event = event
                self.timeStamp = time
                self.data = data
                break
            } 
        default : {
                console.log(`player ${player} caused an error: ${note} on ${time} in event ${event}`)
                self.fail = true
                self.note = note
                self.event= event
                self.timeStamp = time
                self.data = {} 
                break
            }  
        }
    }
}

module.exports = response
