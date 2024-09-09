// bot.js

const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = 'YOUR_BOT_TOKEN_HERE';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Replace with the message ID and role mappings
const roleReactions = {
    messageId: 'YOUR_MESSAGE_ID_HERE',  // The message where users will react to get roles
    emojiRoleMap: {
        '👍': 'ROLE_ID_FOR_THUMBS_UP',   // Replace with your emoji and corresponding role ID
        '🔥': 'ROLE_ID_FOR_FIRE',        // Another example
    }
};

// Bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Listen for reaction adds
client.on('messageReactionAdd', async (reaction, user) => {
    // Check if the reaction is for the right message and the user is not a bot
    if (reaction.message.id === roleReactions.messageId && !user.bot) {
        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        const roleId = roleReactions.emojiRoleMap[reaction.emoji.name];
        if (roleId) {
            try {
                const role = guild.roles.cache.get(roleId);
                await member.roles.add(role);
                console.log(`Added role ${role.name} to user ${user.tag}`);
            } catch (error) {
                console.error('Error adding role:', error);
            }
        }
    }
});

// Listen for reaction removals
client.on('messageReactionRemove', async (reaction, user) => {
    // Check if the reaction is for the right message and the user is not a bot
    if (reaction.message.id === roleReactions.messageId && !user.bot) {
        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        const roleId = roleReactions.emojiRoleMap[reaction.emoji.name];
        if (roleId) {
            try {
                const role = guild.roles.cache.get(roleId);
                await member.roles.remove(role);
                console.log(`Removed role ${role.name} from user ${user.tag}`);
            } catch (error) {
                console.error('Error removing role:', error);
            }
        }
    }
});

// Log in to Discord
client.login(TOKEN);
