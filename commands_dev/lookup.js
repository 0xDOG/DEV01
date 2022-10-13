const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, EmbedBuilder} = require('discord.js');
const CoinGecko = require('coingecko-api');

// Coingecko API prep
const cg = new CoinGecko();

function checkStr(str) {
    return /^[A-Za-z0-9]*$/.test(str);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Look up some details about an asset')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('Ticker of Asset')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        async function coingecko() {
            // Initialize necessary resources
            const coinList = await cg.coins.list();
            const assetInput = interaction.options.getString('input');
            if (!checkStr(assetInput)) return;

            console.log(`Checking: ${assetInput}`)
            // Check if asset exists and find the ID
            let assets = [];
            await coinList.data.find((post) => {
                if (post.symbol === assetInput || post.id === assetInput || post.name === assetInput) {
                    assets.push(post);
                }
            })

            async function buildEmbed(asset) {
                let embedContent = ['test'];

                return new EmbedBuilder()
                        .setTitle(`[${asset.symbol.toUpperCase()}] - ${asset.name}`)
                        .setDescription(embedContent.join('\n'))
                        .setColor('Green');
            }

            // Return outcome
            if (assets.length === 0) {
                await interaction.editReply({
                    content: `Asset not found: ${assetInput}`
                });
            } else if (assets.length === 1){
                await interaction.editReply({
                    embeds: [ await buildEmbed(assets[0]) ]
                });
            } else {
                let assetOptions = [];
                for (const asset of assets) {
                    const myOption = {
                        label: asset.symbol.toUpperCase(),
                        description: asset.name,
                        value: asset.id,
                    }

                    assetOptions.push(myOption)
                }

                await interaction.editReply({
                    content: `Which one would you like to look up?`,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new SelectMenuBuilder()
                                    .setCustomId('select')
                                    .setPlaceholder('Nothing Selected')
                                    .addOptions(assetOptions),
                            )
                    ]
                })

                await interaction.fetchReply()
                    .then(reply => {
                        const filter = ( interaction ) => interaction.customId === 'select'
                        const collector = reply.createMessageComponentCollector({
                            filter,
                            time: 30000
                        });

                        collector.once('collect', async ( option ) => {
                            let asset;
                            assets.find((obj) => {
                                if (obj.id === option.values[0]) {
                                    asset = obj;
                                }
                            })
                            await interaction.editReply({
                                embeds: [ await buildEmbed(asset) ],
                                components: []
                            })
                            collector.stop();
                        })
                    })
            }
        }

        await coingecko()
    },
};