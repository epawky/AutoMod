// bot.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { addRole, removeRole, createPrivateThread } = require('./utils');  // Import utils
const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Role and message IDs
const RULES_MESSAGE_ID = '1277702759726055505';
const JUST_JOINED_ROLE_ID = '1283155306834301008';
const READ_RULES_ROLE_ID = '1277685187248914548';
const CAPO_ROLE_ID = '1277488575323308033';
const INFORMATION_CHANNEL_ID = '1283160349834477706';

// Bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event: Member joins the server
client.on('guildMemberAdd', async (member) => {
    await addRole(member, JUST_JOINED_ROLE_ID);  // Assign 'Just Joined' role
});

// Event: Member reacts to the rules message
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.id === RULES_MESSAGE_ID && !user.bot && reaction.emoji.name === '✅') {
        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        await removeRole(member, JUST_JOINED_ROLE_ID);  // Remove 'Just Joined' role
        await addRole(member, READ_RULES_ROLE_ID);  // Assign 'Read the Rules' role

        // Create a private thread and ask for school email
        const channel = guild.channels.cache.get(INFORMATION_CHANNEL_ID);
        const capoRole = guild.roles.cache.get(CAPO_ROLE_ID);
        const thread = await createPrivateThread(channel, `Onboarding ${user.tag}`, user, capoRole);

        if (thread) {
            await thread.send(`Hello ${user}, welcome to the server! Please provide your school email for verification.`);
        }
    }
});
client.login(TOKEN);

