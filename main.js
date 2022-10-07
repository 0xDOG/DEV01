const { Client, GatewayIntentBits } = require('discord.js');
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

// When Client Ready, Run this code once:
client.once('ready', () => {
    console.log('Ready!');
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!')
    }
})

client.login(token);
