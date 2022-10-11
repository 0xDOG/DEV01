// noinspection DuplicatedCode

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const got = require("got");
const {createWriteStream} = require("node:fs");

const filesPath = path.join(__dirname, '../files');
const csvPath = path.join(filesPath, 'audit_latest.csv'); // Needs to become adjustable eventually

let permittedTagsUpper = []

fs.readFile(csvPath, "utf8", (err, data) => {
    permittedTagsUpper = data.split("\r\n").filter(element => {
        return element !== '' && element !== 'Discord';
    });
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pclean')
        .setDescription('Enables you to kick all members that should not be in the server')
        .addSubcommand(
            subcommand => subcommand
                .setName('update')
                .setDescription('Upload a new CSV of permitted user tags.')
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('run')
                .setDescription('Run the Patreon Cleaner')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'update') {
            if (interaction.member.user.id !== '305414115210559498') {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('CSV upload for Patreon Cleaner')
                            .setDescription('Sorry, only Dip can upload for now.')
                            .setColor('Blue'),
                    ]
                })
            }
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
                                .setDescription('Failed to upload a CSV within 25 seconds, try again.')
                                .setColor('Red'),
                        ]
                    })
                }
            })

        } else if (interaction.options.getSubcommand() === 'run') {
            // Defer Reply
            await interaction.deferReply();

            // Permission Safety, block button if no permissions
            const permissions = interaction.memberPermissions
            let startButton
            if (!permissions) { return }
            if (!permissions.has('KickMembers')) {
                startButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('start')
                            .setLabel('No Permissions')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                    )
            } else {
                startButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('start')
                            .setLabel('Start Cleanup')
                            .setStyle(ButtonStyle.Danger),
                    )
            }

            // Fetch all members
            const members = await interaction.guild.members.fetch();

            // Convert everything in the CSV to lowercase for comparison later.
            const permittedTags = permittedTagsUpper.map(el => {
                return el.toLowerCase();
            });

            // Initialize Array and Populate exceptions.
            let memberTags = [];
            const exceptionTags = ['nick scalps#6134', 'patreon#1968', 'memberlist#4997'];

            // From all members, grab the tags and add them to memberTags in lowercase for comparison.
            for (const member of members) {
                memberTags.push(member[1].user.tag.toLowerCase())
            }

            // Create a list of all users that shouldn't be in the server.
            const filteredTags = memberTags.filter(el => {
                return !permittedTags.concat(exceptionTags).includes( el );
            });

            const filteredIds = []

            // Convert the list of tags to ID's so the bot can kick them.
            for (const member of members) {
                if (filteredTags.includes(member[1].user.tag.toLowerCase())) {
                    filteredIds.push(member[0])
                }
            }

            // Kicking code, loops through all of the names in X increments and sends messages with confirmations.
            let kickTotal = 0
            let failedKicks = 0

            let delta = 8
            if (filteredIds.length < 8) {
                delta = filteredIds.length
            }
            let i = 0
            async function kickAll() {
                let passFail = 'Green'
                let embedLines = []
                setTimeout( async () => {
                    for (let j = 0; j < delta; j++) {
                        const member = await interaction.guild.members.fetch(filteredIds[i + j])
                        if (member) {
                            await member.kick(`Patreon Cleanup ${i+j}/${filteredIds.length}`)
                                .then(() => {
                                    embedLines.push(`:white_check_mark: - \`${member.user.id}\` - \`${member.user.tag}\``);
                                    console.log(`Member Kicked: ${member.user.tag}`);
                                    kickTotal++
                                })
                                .catch((err) => {
                                    embedLines.push(`:no_entry_sign: - \`${member.user.id}\` - \`${member.user.tag}\``);
                                    console.error(`Member Not Kicked: ${member.user.tag} - ${err}`);
                                    failedKicks++
                                    passFail = 'Red'
                                });
                        } else {
                            embedLines.push(`:bangbang:  - \`${filteredIds[i+j]}\``);
                            console.log(`Member Not Kicked: ${filteredIds[i+j]}`);
                            failedKicks++
                            passFail = 'Red'
                        }
                    }
                    interaction.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(passFail)
                            .setTitle(`Kicked Users: ${kickTotal}/${filteredIds.length} | Failed Kicks: ${failedKicks}`)
                            .setDescription(embedLines.join('\n'))
                            .setTimestamp(),
                        ]
                    })
                    i += delta
                    if (i <= filteredIds.length - delta) {
                        kickAll();
                    }
                }, 3000)
            }

            // Button Handling
            const filter = ( el ) => el.customId === 'start'
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 20000
            });

            collector.once('collect', async ( el ) => {
                await el.update({
                    components: [new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('start')
                                .setLabel('Started Cleanup..')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true),
                        )]
                })
                await kickAll()
            })

            collector.once('end', async () => {
                await interaction.editReply({
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

            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Patreon Cleanup')
                    .setDescription(`
                    By clicking the button you will kick up to **${filteredTags.length}** users.\n
                    *These users either shouldn't be in the discord due to expired memberships or they have changed their discord usernames since linking to patreon.*\n
                `)
                    .addFields(
                        {
                            name: 'Details',
                            value: `
                            Members in server: **${memberTags.length}**
                            Patreons Linked: **${permittedTags.length}**
                            Special Exceptions: **${exceptionTags.length}**
                            Estimated Time: **${Math.round((3 * filteredTags.length / delta) / 60)} Minutes**
                        `
                        }
                    )
                ],
                components: [startButton]
            })
        }
    }
}