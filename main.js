const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create Client Instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// When Client Ready, Run this code once:
client.once('ready', () => {
    console.log('Ready!');
})

// Fire when command hits.
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true })
    }
});

client.login(token);
