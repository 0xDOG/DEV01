const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fkick')
        .setDescription('Fake Kicks a player')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Target User')
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for Kick')
                .setRequired(false)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('target');
        return interaction.reply(`[Fake] Kicked ${member.user.tag} - ${member.user.id}`)
    },
};