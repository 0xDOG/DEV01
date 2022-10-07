const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Gives info on User or Server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Info about user')
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The user')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Info about the server')
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target');

            if (user) {
                await interaction.reply(`${user.tag} - ${user.id}`);
            } else {
                await interaction.reply(`${interaction.user.tag} - ${interaction.user.id}`);
            }
        } else if (interaction.options.getSubcommand() === 'server') {
            await interaction.reply(`**Server name:** ${interaction.guild.name}\n**Total Members:** ${interaction.guild.memberCount}`)
        }
    },
};