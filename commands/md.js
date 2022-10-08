const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('md')
        .setDescription('Should find all members in server'),
    async execute(interaction) {
        const members = await interaction.guild.members.fetch();
        const filesPath = path.join(__dirname, '../files');
        const csvPath = path.join(filesPath, 'audit_latest.csv'); // Needs to become adjustable eventually

        let memberTags = [];
        const exceptionTags = ['Nick Scalps#6134'];

        // Add tags to memberTags list
        for (const member of members) {
            memberTags.push(member[1].user.tag)
        }

        fs.readFile(csvPath, "utf8", (err, data) => {
            const permittedTags = data.split("\r\n").filter(element => {
                return element !== '' && element !== 'Discord';
            });

            const filteredTags = memberTags.filter(el => {
                return permittedTags.concat(exceptionTags).indexOf( el ) < 0
            })

            return interaction.reply({
                content: `Members: ${memberTags.length}\nPermitted: ${permittedTags.length}\nExceptions: ${exceptionTags.length}\n\n**To be kicked**: ${filteredTags.length}`
            })
        });
    }
}