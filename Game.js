
class Game {
    isPlaying = false
    deadPlayers = []
    voice = undefined
    
    constructor(voice) {
        this.voice = voice
    }

    ToggleMute(mute) {
        if (mute === undefined) mute = !this.isPlaying

        for (let member of this.voice.members) {
            if (member[1].user.bot) continue
            if (!this.deadPlayers.includes(member[1].user.id))
                member[1].voice.setMute(mute)
        }
    
        this.isPlaying = mute
    }

    Die(member, id) {
        if (this.deadPlayers.includes(id)) return false

        this.deadPlayers.push(id)
        if (!this.isPlaying)
            member.voice.setMute(true)
    }

    Resurrect(member, id) {
        if (!this.deadPlayers.includes(id)) return false
    
        const index = this.deadPlayers.indexOf(id)
        if (index > -1)
            this.deadPlayers.splice(index, 1)
    
        if (!this.isPlaying)
            member.voice.setMute(false)
    }

    Reset() {
        this.isPlaying = false
        this.deadPlayers = []

        for (let member of this.voice.members) {
            if (member[1].user.bot) continue
            member[1].voice.setMute(false)
        }
    }
}

module.exports = {
    Game
}