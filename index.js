const { Client, UserManager } = require('discord.js')
const client = new Client()
const prefix = "."

let channels = {}

if (!!process.env.ID) {
    console.log("Enviroment variable ID not set")
    process.exit(1)
}

client.login(process.env.ID)

client.on("ready", () => {
    console.log("Bot loaded")
})

client.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(" ")

    if (message.deletable) message.delete();

    const cmd = commands[args[0].toLowerCase()]

    if (!!channels[message.channel]) {
        if (!anywereCommands.includes(args[0])) {
            message.channel.send("Non puoi usare questo comando in questo canale")
                .then((m) => {
                    if (m.deletable)
                        m.delete({ timeout: 3500 })
                })
            return
        }
    }
    
    const reply = cmd(args, message)

    if (reply && reply.text) {
        let msg = message.channel.send(reply.text);
        if (reply.delete || !!reply.delete)
            msg.then((m) => {
                if (m.deletable)
                    m.delete({ timeout: reply.time || 5000 })
            })
    }
})

const anywereCommands = [
    "impostacanale",
]

const commands = {
    "impostacanale": (args, message) => {
        channels[message.channel] = { 
            voice: message.member.voice.channel,
            deadPlayers: [],
            isPlaying: true,
        }

        return {
            text: "Ora il canale testuale " + message.channel.name + " e' collegato al canale vocale " + message.member.voice.channel.name,
        }
    },
    "rimuovicanale": (args, message) => {
        reset(message.channel)
        channels[message.channel] = undefined

        return response
    },
    "muta": (args, message) => {
        for (let member of channels[message.channel].voice.members) {
            if (member[1].user.bot) continue
            if (!channels[message.channel].deadPlayers.includes(member[1].user.id))
                mute(member[1], true)
        }

        channels[message.channel].isPlaying = true

        return { 
            text: message.author.username + " ha mutato tutti"
        }
    },
    "smuta": (args, message) => {
        for (let member of channels[message.channel].voice.members) {
            if (member[1].user.bot) continue
            if (!channels[message.channel].deadPlayers.includes(member[1].user.id))
                mute(member[1], false)
        }

        channels[message.channel].isPlaying = false

        return { 
            text: message.author.username + " ha smutato tutti"
        }
    },
    "morto": (args, message) => {
        channels[message.channel].deadPlayers.push(message.author.id)

        mute(message.member, true)

        if (args[1])
            return message.member.nickname + " e' stato/a " + args[1]

        return { 
            text: message.member.nickname + " e' morto/a"
        }
    },
    "resuscita": (args, message) => {
        if (!channels[message.channel].deadPlayers.includes(message.author.id)) return "Come ti resuscito se non sei morto/a?"

        const index = channels[message.channel].deadPlayers.indexOf(message.author.id)
        if (index > -1)
            channels[message.channel].deadPlayers.splice(index, 1)

        if (!channels[message.channel].isPlaying)
            mute(message.member, false)

        let response
        let rand = Math.round(Math.random() * 1)

        if (rand == 0) response = message.author.username + " ha usato il totem of undying"
        else response = "You are not gonna kill my allies!!! cit. Sage"

        return response
    },
    "riavvia": (args, message) => {
        reset(message.channel)
        
        let response = args[1] ? "I vincitori di questo game sono " + args[1] + "\n Startato nuovo game..." : "Startando un nuovo game..."
            
        return {
            text: response
        }
    },
}

function reset(channel) {
    for (let member of channels[channel].voice.members) {
        if (!member[1].user.bot)
            mute(member[1], false)
    }

    channels[channel].deadPlayers = []
}

async function mute(member, mute) {
    member.voice.setMute(mute)
}