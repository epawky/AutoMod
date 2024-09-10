// bot.js
require('dotenv').config({ path: './production.env' });
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { addRole, removeRole, createPrivateThread, isKentEmail } = require('./utils');  // Import utils
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
const AUTOMOD_CHANNEL_ID = '1283184297980723291'; 
const INTRODUCTIONS_CHANNEL_ID = '1277586348626149416';
const ASSOCIATE_ROLE_ID = '1277679159065313443'; 
const ELIGIBLE_TO_PLAY_ROLE_ID = '1278440811876581386';
const GENERAL_CHANNEL_ID = '1275098902743220290';

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

                if (isKentEmail(email)) {
                    // Post email in automod channel
                    await automodChannel.send(`New user email: ${email} (Verified Kent.edu domain)`);

                    // Ask for chosen name
                    await thread.send('What name would you like to use as your nickname on the server?');
                    const nameCollector = thread.createMessageCollector({ max: 1, time: 60000 });

                    nameCollector.on('collect', async (nameMessage) => {
                        const chosenName = nameMessage.content;

                        // Update nickname
                        await member.setNickname(chosenName);

                        // Manually add user to the introductions channel
                        const introductionsChannel = guild.channels.cache.get(INTRODUCTIONS_CHANNEL_ID);
                        await introductionsChannel.permissionOverwrites.create(member, {
                            VIEW_CHANNEL: true,  // Allow the user to view the channel
                            SEND_MESSAGES: true,  // Allow the user to send messages
                        });

                        await thread.send(
                            `Welcome to the server, ${chosenName}!
                            
                            Please introduce yourself in the #introductions channel by sharing:
                            - Your chosen name
                            - Your major
                            - Your class status (freshman, junior, senior)
                            - Which campus you're on
                            - Your favorite dinosaur
                            
                            Don't forget to check out the reaction roles in the Important section. 
                            You can react to specific messages to receive roles that will grant you access to more areas of the Discord server.`
                        );
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

// Listen for messages in the introductions channel
client.on('messageCreate', async (message) => {
    if (message.channel.id === INTRODUCTIONS_CHANNEL_ID && !message.author.bot) {
        const member = message.guild.members.cache.get(message.author.id);

        if (message.content.length > 30) {
            // Assign the Associate role
            await addRole(member, ASSOCIATE_ROLE_ID);

            // Assign the Eligible to Play role after Associate
            await addRole(member, ELIGIBLE_TO_PLAY_ROLE_ID);

            

            // Post a welcome message in the general channel
            const generalChannel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);  // Use the constant
            if (generalChannel) {
                await generalChannel.send(`Welcome ${member.user.tag}! We're glad you came to visit.`);
            }

        } else {
            // Message is less than 30 characters, take the alternate action
            
            // Copy the message to the automod channel
            const automodChannel = message.guild.channels.cache.get(AUTOMOD_CHANNEL_ID);
            if (automodChannel) {
                await automodChannel.send(`Message from ${member.user.tag} in #introductions was too short: "${message.content}"`);
            }

            // Delete (hide) the message in the introductions channel
            await message.delete();

            // DM the user
            await member.send('Hi! Your introduction message was a bit too short. A capo will manually approve your membership within 24 hours.');
        }
    }
});
// Attempt to log in using the token
client.login(TOKEN);