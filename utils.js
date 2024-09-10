// utils.js

/**
 * Adds a role to a guild member.
 * @param {GuildMember} member - The guild member to whom the role will be added.
 * @param {string} roleId - The ID of the role to be added.
 */
async function addRole(member, roleId) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
        await member.roles.add(role);
        console.log(`Added role ${role.name} to ${member.user.tag}`);
    }
}

/**
 * Removes a role from a guild member.
 * @param {GuildMember} member - The guild member from whom the role will be removed.
 * @param {string} roleId - The ID of the role to be removed.
 */
async function removeRole(member, roleId) {
    const role = member.guild.roles.cache.get(roleId);
    if (role && member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        console.log(`Removed role ${role.name} from ${member.user.tag}`);
    }
}

/**
 * Creates a private thread in the given channel.
 * @param {TextChannel} channel - The channel where the thread will be created.
 * @param {string} threadName - The name of the thread.
 * @param {User} user - The user who will be added to the thread.
 * @param {Role} role - The role to be added to the thread.
 * @returns {ThreadChannel} - The created thread channel.
 */
async function createPrivateThread(channel, threadName, user, role) {
    const thread = await channel.threads.create({
        name: threadName,
        autoArchiveDuration: 60,  // Archive after 60 minutes of inactivity
        type: 'GUILD_PRIVATE_THREAD',
        invitable: false
    });

    await thread.members.add(user.id);
    for (const member of role.members.values()) {
        await thread.members.add(member.id);
    }

    console.log(`Private thread created: ${thread.name} for ${user.tag}`);
    return thread;
}

/**
 * Checks if the given email is from the 'kent.edu' domain.
 * @param {string} email - The email to check.
 * @returns {boolean} - True if the email is from 'kent.edu', false otherwise.
 */
function isKentEmail(email) {
    return email.endsWith('@kent.edu');
}

module.exports = {
    addRole,
    removeRole,
    createPrivateThread,
    isKentEmail
};
