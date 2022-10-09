const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('Button Testing'),
    async execute(interaction) {
        const filter = ( el ) => el.customId === 'start'
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000
        });

        collector.once('collect', async ( el ) => {
            await el.update({
                content: 'Button was clicked',
                components: [new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('start')
                            .setLabel('Started Cleanup..')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                    )]
            })
        })

        collector.once('end', async ( el ) => {
            await interaction.editReply({
                content: 'Button was not clicked',
                components: [new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('start')
                            .setLabel('Expired..')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                    )]
            })
        })

        await interaction.reply({
            content: 'Button Test',
            components: [new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('start')
                        .setLabel('Start Cleanup')
                        .setStyle(ButtonStyle.Danger),
                )]
        });
    },
};