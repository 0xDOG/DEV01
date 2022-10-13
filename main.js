const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, guildId } = require('./config.json');

/*
Initialize Client
 */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

/*
Load Commands
 */

client.commands = new Collection();
client.devCommands = new Collection();
client.devId = guildId;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Global Commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    console.log(`[Global] >> Loaded Command /${command.data.name}`)

    // Set a new item in the collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Dev Commands
const devCommandsPath = path.join(__dirname, 'commands_dev');
const devCommandFiles = fs.readdirSync(devCommandsPath).filter(file => file.endsWith('.js'));

for (const file of devCommandFiles) {
    const filePath = path.join(devCommandsPath, file);
    const devCommand = require(filePath);

    console.log(`[DEV] >> Loaded Command /${devCommand.data.name}`)

    // Set a new item in the collection
    // With the key as the command name and the value as the exported module
    client.devCommands.set(devCommand.data.name, devCommand);
}

/*
Load Events
 */

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    console.log(`[Global] >> Loaded Event \'${event.name}\'`)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

/*
Login
 */

client.login(token);
