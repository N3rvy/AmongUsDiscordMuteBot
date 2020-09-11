if (process.argv.length < 4) {
    console.log("Must have 2 arguments ID(discord bot id) and LEN(language name)")
    process.exit(1)
}

const { CommandManager } = require('./CommandsManager.js')
const { Client } = require('discord.js')
const fs = require('fs')
const client = new Client()

//************  Loading language JSON  **************

const language = JSON.parse(fs.readFileSync(process.argv[3] + ".json", 'utf-8'))

//************  Initialization  **************

client.login(process.argv[2])

CommandManager.Init(language)

//************  Setting up events  **************

client.on("ready", () => {
    console.log("Bot loaded")
})

client.on("message", async message => {
    if (CommandManager.IsCommand(message))
        CommandManager.ExecuteCommand(message)
})

//************  Setting up commands  **************

CommandManager.AddCommand("set", (args, message) => {
    CommandManager.NewGame(message.channel, message.member.voice.channel)
})

CommandManager.AddCommand("reset", (args, message) => {
    CommandManager.games[message.channel].Reset()
    CommandManager.games[message.channel] = undefined
})

CommandManager.AddCommand("mute", (args, message) => {
    CommandManager.games[message.channel].ToggleMute(true)
})

CommandManager.AddCommand("unmute", (args, message) => {
    CommandManager.games[message.channel].ToggleMute(false)
})

CommandManager.AddCommand("dead", (args, message) => {
    return CommandManager.games[message.channel].Die(message.member, message.author.id)
})

CommandManager.AddCommand("resurrect", (args, message) => {
    return CommandManager.games[message.channel].Resurrect(message.member, message.author.id)
})

CommandManager.AddCommand("restart", (args, message) => {
    CommandManager.games[message.channel].Reset()
})