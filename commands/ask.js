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
        .addStringOption(option => option.setName('question').setRequired(true).setDescription('The question you\'d like to ask.')),

    async execute(interaction) {
        let atQ = interaction.options.getString('question').replace(' ', '-')
        var query;
        if(interaction.options.getString('question').includes("stats")) {
            query = `${atQ}-stats`
        } else {
            query = `${atQ}`
        }
        var url = `https://www.statmuse.com/ask/${query}`
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
                    .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                    .setDescription('I didn\'t quite catch that; try rewording your question.')
                    .setThumbnail(image)
                    .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                    .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            }
            // normal function; runs if the answer is not too similar to the question
            const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
            const embed = new Discord.MessageEmbed()
            .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                .setDescription(answer)
                .setThumbnail(image)
                .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                .setColor('#0099ff')
            interaction.reply({embeds: [embed]})
            return;
        } catch(e) {
            try {
                // this code runs if the answer is not found. The element structure is different if it doesn't have an answer, so I have to change the code a little bit to make it appear.
                const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].textContent
                const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                    .setDescription(answer)
                    .setThumbnail(image)
                    .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                    .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            } catch(e) {
                
            }
        } 
    }
}
