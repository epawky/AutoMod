// utils.js

/**
 * Logs a message to the console with a timestamp.
 * @param {string} message - The message to log.
 */
function logWithTimestamp(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

/**
 * Formats a string to be used as a reply in a Discord message.
 * @param {string} message - The message to format.
 * @returns {string} - The formatted message.
 */
function formatMessage(message) {
    return `**${message}**`;
}

/**
 * Handles errors by logging them and sending a message to a Discord channel.
 * @param {Error} error - The error object.
 * @param {Object} message - The Discord message object.
 */
async function handleError(error, message) {
    console.error('An error occurred:', error);

    // Try to send an error message to the Discord channel
    try {
        await message.channel.send(`An error occurred: ${error.message}`);
    } catch (err) {
        console.error('Failed to send error message to the channel:', err);
    }
}

/**
 * Checks if a given user is a bot.
 * @param {Object} user - The Discord user object.
 * @returns {boolean} - True if the user is a bot, false otherwise.
 */
function isBot(user) {
    return user.bot;
}

module.exports = {
    logWithTimestamp,
    formatMessage,
    handleError,
    isBot
};
