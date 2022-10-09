const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createWriteStream } = require('node:fs');
const path = require('node:path');
const got = require('got');

const filesPath = path.join(__dirname, '../files');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Catches a message'),
    async execute(interaction) {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('CSV upload for Patreon Cleaner')
                    .setDescription('Please upload a .CSV in the next 25 seconds.')
                    .setColor('Blue'),
            ]
        })

        const collector = interaction.channel.createMessageCollector({
            time: 25000
        })

        let hasAttachment = false;
        collector.on('collect', ( message ) => {
            if (message.author.id === interaction.member.user.id && hasAttachment === false) {
                if (message.attachments.first().name.endsWith('.csv')) {
                    hasAttachment = true;
                    const url = message.attachments.first().url
                    console.log(url)

                    const fileName = 'audit_latest.csv';
                    const fileStream = got.stream(url);
                    const writer = createWriteStream(path.join(filesPath, fileName))

                    fileStream
                        .on('downloadProgress', ({ transferred, total, percent }) => {
                            const percentage = Math.round(100*percent);
                            console.log(`Download progress: ${transferred}/${total} - ${percentage}%`)
                        })
                        .on('error', (err) => {
                            console.error(`Download Failed: ${err.message}`)
                        })

                    writer
                        .on('finish', () => {
                            interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle('CSV upload for Patreon Cleaner')
                                        .setDescription(`CSV Downloaded.`)
                                        .setColor('Green'),
                                ]
                            })
                            console.log(`File downloaded to ${path.join(filesPath, fileName)}`)
                        })
                        .on('error', (err) => {
                            console.log(`Failed to write file: ${err.message}`)
                        })

                    fileStream.pipe(writer);
                }
            }
        })

        collector.on('end', () => {
            if (!hasAttachment) {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('CSV upload for Patreon Cleaner')
                            .setDescription('Failed to upload a CSV within 15 seconds, try again.')
                            .setColor('Red'),
                    ]
                })
            }
        })
    },
};