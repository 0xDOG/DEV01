const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

// Command List
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
]
    .map(command => command.toJSON());


// Deploy (no change)
const rest = new REST({ version: '10'}).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} global commands.`))
    .catch(console.error);

