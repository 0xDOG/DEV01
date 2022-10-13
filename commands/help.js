const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command'),
    async execute(interaction) {

        let commandList = [];
        let devCommandList = [];
        for (const command of interaction.client.commands) {
            if (!command || command[1].data.name === 'help') continue;
            commandList.push(`/${command[1].data.name} - ${command[1].data.description}`);
        }

        for (const command of interaction.client.devCommands) {
            if (!command || command[1].data.name === 'help') continue;
            devCommandList.push(`/${command[1].data.name} - ${command[1].data.description}`)
        }

        let replyEmbed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('Shows information about available commands')
            .setColor('Blue');

        if (commandList.length > 0) {
            replyEmbed
                .addFields(
                    {
                        name: 'Commands',
                        value: commandList.join('\n')
                    }
                );
        }

        if (devCommandList.length > 0 && interaction.guild.id === interaction.client.devId) {
            replyEmbed
                .addFields(
                    {
                        name: 'Development Commands',
                        value: devCommandList.join('\n')
                    },
                );
        }

        await interaction.reply({
            embeds: [ replyEmbed ]
        })
    },
};