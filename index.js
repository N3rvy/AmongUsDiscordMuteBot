const { Client } = require('discord.js')
const client = new Client()
const prefix = "."

let connection,
    deadPlayers = [],
    isPlaying = false

client.login('NzUwMzI3NDE1OTUxMzI3Mjkz.X0463A.nL7GqBL3TGltTz0J-FfacEkBPLs')

client.on("ready", () => {
    console.log("Bot loaded")
})

client.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(" ")

    if (message.deletable) message.delete();

    const cmd = commands[args[0].toLowerCase()]
    if (cmd === undefined) message.channel.send("Comando non valido")
    else {
        const reply = cmd(args, message)

        if (reply !== undefined && reply !== "")
            message.channel.send(reply)
    }
})

const commands = {
    "entra": (args, message) => {
        if (message.member.voice.channel) {
            const conn = async () => {
                connection = await message.member.voice.channel.join()
                
                reset()    
            }
            conn()
        } else
            return "Non sei in un canale vocale"
    },
    "esci": (args, message) => {
        if (!connection) return "Non sono in un canale per piacere usa .join prima di usare gli altri comandi"

        reset()

        connection.disconnect()
        connection = undefined
    },
    "muta": (args, message) => {
        if (!connection) return "Non sono in un canale per piacere usa .join prima di usare gli altri comandi"

        for (let member of connection.channel.members) {
            if (member[1].user.bot) continue
            if (!deadPlayers.includes(member[1].user.id))
                mute(member[1], true)
        }

        isPlaying = true

        return message.author.username + " ha mutato tutti"
    },
    "smuta": (args, message) => {
        if (!connection) return "Non sono in un canale per piacere usa .join prima di usare gli altri comandi"

        for (let member of connection.channel.members) {
            if (member[1].user.bot) continue
            if (!deadPlayers.includes(member[1].user.id))
                mute(member[1], false)
        }

        isPlaying = false

        return message.author.username + " ha smutato tutti"
    },
    "morto": (args, message) => {
        deadPlayers.push(message.author.id)

        mute(message.member, true)

        return message.author.username + " e` morto/a"
    },
    "resuscita": (args, message) => {
        const index = deadPlayers.indexOf(message.author.id)
        if (index > -1)
            deadPlayers.splice(index, 1)

        if (!isPlaying)
            mute(message.member, false)
        
        return message.author.username + " ha usato il totem of undying"
    },
    "numeromorti": () => {
        if (isPlaying) return "Non e' possibile utilizzare questo comando durante questa fase della partita"
        return "Player morti: " + deadPlayers.length
    },
    "riavvia": (args, message) => {
        if (!connection) return "Non sono in un canale per piacere usa .join prima di usare gli altri comandi"
        
        reset()

        return "I vincitori di questo game sono " + args[1] + "\n Startato nuovo game"
    },
    "codice": (args, message) => {
        if (args[1] === undefined || args[1].length != 4) return "Codice non valido"

        message.guild.me.setNickname("!CODICE: " + args[1])
    },
    "resettanome": (args, message) => {
        message.guild.me.setNickname("Among Us Auto mute")
    },
}

function reset() {
    for (let member of connection.channel.members) {
        if (!member[1].user.bot)
            mute(member[1], false)
    }

    deadPlayers = []
}

async function mutedeaf(member, mute) {
    mute(member, mute)
    deaf(member, mute)
}

async function mute(member, mute) {
    member.voice.setMute(mute)
}

async function deaf(member, deaf) {
    member.voice.setDeaf(deaf)
}