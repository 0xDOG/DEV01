const fs = require('node:fs');
const path = require('node:path');

const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

// Command List
const commands = []

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

// Deploy (no change)
const rest = new REST({ version: '10'}).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} global commands.`))
    .catch(console.error);

