const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
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
        let reason = interaction.options.getString('reason');

        if (!reason) { reason = 'None given' }

        if (member) {
            await member.kick(reason)
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`${member.user.tag} Kicked`)
                    .setDescription(`[ID] \`${member.user.id}\`\n[Reason]\n${reason}`)
                    .setTimestamp(),
                ]
            })
        } else {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Failed to Kick user')
                    .setDescription(`Member does not exist`)
                    .setTimestamp(),
                ]
            })
        }
    },
};