class response  {
    constructor(fail, event, player, note, data){
        var time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                this.fail = false
                this.note = note
                this.event = event
                this.timeStamp = time
                this.data = data
                break
            } 
        default : {
                console.log(`player ${player} caused an error: ${note} on ${time} in event ${event}`)
                this.fail = true
                this.note = note
                this.event= event
                this.timeStamp = time
                this.data = data 
                break
            }  
        }
    }
}

module.exports = response
