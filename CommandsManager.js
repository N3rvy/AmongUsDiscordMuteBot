const { CommandoClient } = require("discord.js-commando")
const { Game } = require("./Game")

const anywereCommands = ["set"]

class CommandManager {
    static prefix
    static commandsAliases = {}
    static commands = {}
    static language

    static games = {}

    static Init(language) {
        this.language = language
        this.prefix = language.prefix
    }

    static AddCommand(command, execute) {
        this.commands[command] = execute
        
        this.language.commands[command].forEach(el => {
            this.commandsAliases[el] = command
        })
    }

    static ExecuteCommand(message) {
        const args = message.content.slice(this.prefix.length).trim().split(" ")
        const command = this.commandsAliases[args[0]]
        if (message.deletable) message.delete();

        if (!this.canBeUsed(command, message)) return

        let cmd = this.commands[command]
        if (cmd) {
            this.handleReply(cmd(args, message), message, args, command)
        }
    }

    static NewGame(channel, voiceChannel) {
        this.games[channel] = new Game(voiceChannel)
    }

    static IsCommand(message) {
        return !message.author.bot && message.content.startsWith(this.prefix)
    }

    static handleReply(reply, message, args, command) {
        if (reply === undefined) {
            let repsonses = this.language.responses[reply === false ? "err_" + command : command]
            let msg = message.channel.send(FormatResponse(GetRandomPhrase(repsonses), message, args));
            msg.then((m) => {
                if (m.deletable)
                    m.delete({ timeout: 10000 })
            })
        }
    }

    static canBeUsed(cmd, message) {
        if (!this.games[message.channel]) {
            if (!anywereCommands.includes(cmd)) {
                message.channel.send("Non puoi usare questo comando in questo canale")
                    .then((m) => {
                        if (m.deletable)
                            m.delete({ timeout: 3500 })
                    })
                return false
            }
        }
        return true
    }
}

function GetRandomPhrase(phrases) {
    let ran = Math.round(Math.random() * (phrases.length - 1))
    return phrases[ran]
}

function FormatResponse(response, message, args) {
    response = response.replace("{author}", message.member.nickname)
    response = response.replace("{channel}", message.channel.name)
    response = response.replace("{voiceChannel}", message.member.voice.channel.name)

    // Hard coded for the moment
    response = response.replace("{0}", args[1])
    response = response.replace("{1}", args[2])
    response = response.replace("{2}", args[3])

    return response
}

module.exports = {
    CommandManager
}