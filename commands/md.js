const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('md')
        .setDescription('Should find all members in server'),
    async execute(interaction) {
        const members = await interaction.guild.members.fetch();

        let memberTags = [];
        let permittedTags = [];
        let exceptionTags = [];
        let filteredTags = [];

        for (const member of members) {
            memberTags.push(member[1].user.tag)
        }

        console.log(memberTags)
        return interaction.reply({
            content: `Members: ${memberTags.length}\nPermitted: ${permittedTags.length}\nExceptions: ${exceptionTags.length}\n\n**To be kicked**: ${filteredTags.length}`
        })
    }
}