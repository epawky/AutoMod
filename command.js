// command.js

/**
 * Handles the execution of a command based on the message content.
 * @param {Object} message - The Discord message object.
 */
async function handleCommand(message) {
    const prefix = '!'; // You can change this to any prefix you prefer

    // Ignore messages that do not start with the prefix or are from bots
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Extract the command and arguments from the message
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Execute different commands based on the input
    switch (command) {
        case 'ping':
            await message.channel.send('Pong!');
            break;
        case 'say':
            const text = args.join(' ');
            if (!text) {
                await message.channel.send('You need to provide a message!');
            } else {
                await message.channel.send(text);
            }
            break;
        case 'help':
            await message.channel.send('Available commands: !ping, !say, !help');
            break;
        default:
            await message.channel.send(`Unknown command: ${command}`);
            break;
    }
}

module.exports = {
    handleCommand
};
