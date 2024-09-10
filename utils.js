// utils.js

/**
 * Adds a role to a member.
 * @param {GuildMember} member - The member to whom the role will be added.
 * @param {string} roleId - The ID of the role to be added.
 */
async function addRole(member, roleId) {
    try {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
            await member.roles.add(role);
            console.log(`Added role ${role.name} to ${member.user.tag}`);
        } else {
            console.error('Role not found:', roleId);
        }
    } catch (error) {
        console.error('Error adding role:', error);
    }
}

/**
 * Removes a role from a member.
 * @param {GuildMember} member - The member from whom the role will be removed.
 * @param {string} roleId - The ID of the role to be removed.
 */
async function removeRole(member, roleId) {
    try {
        const role = member.guild.roles.cache.get(roleId);
        if (role && member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            console.log(`Removed role ${role.name} from ${member.user.tag}`);
        } else {
            console.error('Role not found or not assigned:', roleId);
        }
    } catch (error) {
        console.error('Error removing role:', error);
    }
}

/**
 * Creates a private thread in a specific channel.
 * @param {GuildChannel} channel - The channel where the thread will be created.
 * @param {string} threadName - The name of the thread.
 * @param {User} user - The user to add to the thread.
 * @param {Role} role - The role (e.g., Capo) to add to the thread.
 */
async function createPrivateThread(channel, threadName, user, role) {
    try {
        const thread = await channel.threads.create({
            name: threadName,
            autoArchiveDuration: 60, // Archive after 60 minutes of inactivity
            type: 'GUILD_PRIVATE_THREAD',
            invitable: false
        });

        await thread.members.add(user.id);
        const capos = role.members.map(m => m.id);  // Get all members with the Capo role
        for (const capoId of capos) {
            await thread.members.add(capoId);
        }

        console.log(`Created private thread ${thread.name} for ${user.tag}`);
        return thread;
    } catch (error) {
        console.error('Error creating private thread:', error);
    }
}

module.exports = {
    addRole,
    removeRole,
    createPrivateThread
};
