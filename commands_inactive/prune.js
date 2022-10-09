const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Prune up to 99 messages')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to prune')
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (1 <= amount <= 99) {
            await interaction.channel.bulkDelete(amount, true).catch(err => {
                console.log(err);
                interaction.reply({ content: 'There was an error trying to prune messages in this channel', ephemeral: true});
            })
        } else {
            interaction.reply('Must be an amount between 1 and 99')
        }

        return interaction.reply({ content: `Successfully pruned ${amount} messages`, ephemeral: true})
    }
}