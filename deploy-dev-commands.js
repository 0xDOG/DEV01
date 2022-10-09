const fs = require('node:fs');
const path = require('node:path');

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

// Command List
const commands = []

const commandsPath = path.join(__dirname, 'commands_dev');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log(`Successfully registered ${commands.length} dev commands.`))
    .catch(console.error);