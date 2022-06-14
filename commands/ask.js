const { SlashCommandBuilder } = require('@discordjs/builders');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fetch = require('node-fetch');
const Discord = require('discord.js')
const stringSimilarity = require("string-similarity");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('will answer your question about a player.')
        .addStringOption(option => option.setName('sport').setRequired(true).setDescription('The sport your player plays for.').addChoice("NFL", "NFL").addChoice("NHL", "NHL").addChoice("NBA", "NBA").addChoice("MLB", "MLB").addChoice("PGA", "PGA"))
        .addStringOption(option => option.setName('question').setRequired(true).setDescription('The question you\'d like to ask.')),

    async execute(interaction) {
        const query = interaction.options.getString('question').replace(' ', '-')
        var url = `https://www.statmuse.com/${interaction.options.getString('sport')}/ask/${query}`
        const data = await fetch(url)
        const rawHtml = await data.text()    
        const dom = new JSDOM(rawHtml)

        // Scrapes statmuse, grabs the raw html of the website, and converts it to a DOM so you can access it as you would with react or vanilla JS.

        try {
            const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].children[0].textContent // This grabs the element which contains the answer
            similarity = stringSimilarity.compareTwoStrings(answer, interaction.options.getString('question')) // Compares the answer to the question; needed because when statmuse doesn't know the answer it tends to just echo back the question in a slightly different form. Simple QoL thing
            if(similarity > 0.9) { // runs if the answer is similar enough to the question for the reasoning above
                const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src // grabs the statmuse player image
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Question: ${interaction.options.getString('question')}`)
                    .setDescription('I didn\'t quite catch that; try rewording your question.')
                    .setThumbnail(image)
                    .setFooter('Made by Jayleaf | Powered by Statmuse', 'https://www.statmuse.com/favicon.ico')
                    .setAuthor(`Question asked by ${interaction.user.username}`, interaction.user.displayAvatarURL())
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            }
            // normal function; runs if the answer is not too similar to the question
            const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
            const embed = new Discord.MessageEmbed()
                .setTitle(`Question: ${interaction.options.getString('question')}`)
                .setDescription(answer)
                .setThumbnail(image)
                .setFooter('Made by Jayleaf | Powered by Statmuse', 'https://www.statmuse.com/favicon.ico')
                .setAuthor(`Question asked by ${interaction.user.username}`, interaction.user.displayAvatarURL())
                .setColor('#0099ff')
            interaction.reply({embeds: [embed]})
            return;
        } catch(e) {
            try {
                // this code runs if the answer is not found. The element structure is different if it doesn't have an answer, so I have to change the code a little bit to make it appear.
                const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].textContent
                const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Question: ${interaction.options.getString('question')}`)
                    .setDescription(answer)
                    .setThumbnail(image)
                    .setFooter('Made by Jayleaf | Powered by Statmuse', 'https://www.statmuse.com/favicon.ico')
                    .setAuthor(`Question asked by ${interaction.user.username}`, interaction.user.displayAvatarURL())
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            } catch(e) {
                // This should never run, and if it does, people should report it to me
                interaction.reply({content: "An internal error occurred.", ephemeral: true})
            }
        }
        
            
       
        

        
           
       
    }
}
