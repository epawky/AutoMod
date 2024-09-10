// bot.js
require('dotenv').config({ path: './production.env' });
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
const AUTOMOD_CHANNEL_ID = 'YOUR_AUTOMOD_CHANNEL_ID'; 
const INTRODUCTIONS_CHANNEL_ID = 'YOUR_INTRODUCTIONS_CHANNEL_ID';

// Bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Handle reactions on the rules message
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

            // Collect email and handle the verification
            const emailCollector = thread.createMessageCollector({ max: 1, time: 60000 });
            emailCollector.on('collect', async (emailMessage) => {
                const email = emailMessage.content;
                const automodChannel = guild.channels.cache.get(AUTOMOD_CHANNEL_ID);

                if (email.endsWith('@kent.edu')) {
                    // Post email in automod channel
                    await automodChannel.send(`New user email: ${email} (Verified Kent.edu domain)`);

                    // Ask for chosen name
                    await thread.send('What name would you like to use as your nickname on the server?');
                    const nameCollector = thread.createMessageCollector({ max: 1, time: 60000 });
                    
                    nameCollector.on('collect', async (nameMessage) => {
                        const chosenName = nameMessage.content;

                        // Update nickname
                        await member.setNickname(chosenName);

                        // Send welcome message
                        await thread.send(`Welcome to the server, ${chosenName}! Please post an introduction in the #introductions channel.`);
                        const introductionsChannel = guild.channels.cache.get(INTRODUCTIONS_CHANNEL_ID);
                        await introductionsChannel.send(`Welcome, ${chosenName}! Please introduce yourself.`);

                        // Delete the thread
                        await thread.delete();
                    });
                } else {
                    // Send a DM to the user
                    await user.send('The capos are working on approving your membership. In the meantime, how did you find us?');

                    // Post email and note in automod channel
                    await automodChannel.send(`Non-Kent.edu email received: ${email}. Waiting for approval.`);

                    // Delete the thread
                    await thread.delete();
                }
            });
        }
    }
});

// Attempt to log in using the token
client.login(TOKEN);