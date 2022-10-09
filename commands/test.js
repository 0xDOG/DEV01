const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Catches a message'),
    async execute(interaction) {
        await interaction.reply("[OK]")
    },
};