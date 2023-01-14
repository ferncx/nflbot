const { Client } = require("discord.js");
const configuration = require("../configuration.json");
const fs = require("fs");
/**
 * Listens to the ready event.
 * @type {{once: boolean, name: string, execute(*): void}}
 */
module.exports = {
    name: 'ready',
    once: true,
    /**
     * Executes the event.
     * @param {Client} client
     */
    execute(client) {
        // Making sure the DISCORD_CLIENT_ID is correct.
        if (!configuration.DISCORD_CLIENT_ID) {
            configuration.DISCORD_CLIENT_ID = client.user.id;
            fs.writeFileSync("./configuration.json", JSON.stringify(configuration, null, 2));
            console.warn(`[WARN] The DISCORD_CLIENT_ID variable was not set in configuration.json. We automatically set it to ${client.user.id} for you.`);
        } else if (configuration.DISCORD_CLIENT_ID !== client.user.id) {
            console.warn(`[WARN] The current DISCORD_CLIENT_ID (${configuration.DISCORD_CLIENT_ID} does not match the current application ID (${client.user.id}). We set it for you automatically.`);
            configuration.DISCORD_CLIENT_ID = client.user.id;
            fs.writeFileSync("./configuration.json", JSON.stringify(configuration, null, 2));
        }

        const { AutoPoster } = require('topgg-autoposter')
        const poster = AutoPoster('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4NTc5OTQyNDEwODI2OTU2OSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjczNzE4ODk2fQ.csA9kbw1Fhe6pBlg1KpLFGEXKeJTpJCn803dS3yHOLc', client) // your discord.js or eris client

        // optional
        poster.on('posted', (stats) => { // ran when succesfully posted
        console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
        })

        // Listens for the updateClientActivity event and updates the client presence.
        process.once('updateClientActivity', () => {
            console.log(`[INFO] Connected to Discord as ${client.user.tag} on Shard ${client.shardId}.`);
        
        setInterval(() => {
            client.user.setPresence({
                activities: [
                    {
                        name: `Browsing Stats for ${client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)} users in ${client.guilds.cache.size} servers!`,
                        type: 'PLAYING'
                    }
                ],
                status: 'online'
            });
        }, 15000)
            
        });
    }
}