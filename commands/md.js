const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

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
        .setName('md')
        .setDescription('Should find all members in server'),
    async execute(interaction) {
        const members = await interaction.guild.members.fetch();

        const testTags = ['miracleworker#8763']

        const permittedTags = permittedTagsUpper.map(el => {
            return el.toLowerCase();
        });

        let memberTags = [];
        const exceptionTags = ['nick scalps#6134', 'patreon#1968', 'memberlist#4997'];

        // Add tags to memberTags list
        for (const member of members) {
            memberTags.push(member[1].user.tag.toLowerCase())
        }

        const filteredTags = memberTags.filter(el => {
            return !permittedTags.concat(exceptionTags).includes( el );
        });

        const filteredIds = []

        for (const member of members) {
            if (filteredTags.includes(member[1].user.tag.toLowerCase())) {
                filteredIds.push(member[0])
            }
        }

        const delta = 8
        let i = 0
        function kickAll() {
            let embedLines = []
            setTimeout( async () => {
                for (let j = 0; j < delta; j++) {
                    const member = await interaction.guild.members.fetch(filteredIds[i + j])
                    if (member) {
                        embedLines.push(`:white_check_mark: - \`${member.user.id}\` - \`${member.user.tag}\``);
                        console.log(`Member Found: ${member.user.tag}`);
                    } else {
                        embedLines.push(`:no_entry_sign: - \`${member.user.id}\` - \`${member.user.tag}\``);
                        console.log(`Member Found: ${member.user.tag}`);
                    }
                }
                interaction.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor('Green')
                        .setTitle(`Found users:`)
                        .setDescription(embedLines.join('\n'))
                        .setTimestamp(),
                    ]
                })
                i += delta
                if (i < filteredIds.length - delta) {
                    kickAll();
                }
            }, 3000)
        }

        kickAll();


        // console.log(memberTags)
        // console.log(permittedTags)
        // console.log(filteredTags)


        return interaction.reply({
            content: `Members: ${memberTags.length}\nPermitted: ${permittedTags.length}\nExceptions: ${exceptionTags.length}\n\n**To be kicked**: ${filteredTags.length}`
        })
    }
}