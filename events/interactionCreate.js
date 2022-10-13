const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        let command = interaction.client.commands.get(interaction.commandName);
        let logType = 'Command'

        if (!command) {
            command = interaction.client.devCommands.get(interaction.commandName)
            logType = 'devCommand'
            if (!command) return;
        }

        console.log(`[${logType}] - ${interaction.user.tag} used /${interaction.commandName} - #${interaction.channel.name}`)

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`${error.name} - ${error.message}`)
                        .setDescription('There was an error while executing this command.')
                ],
                ephemeral: true
            })
        }
    },
};