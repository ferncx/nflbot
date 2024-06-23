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
        let original_question = interaction.options.getString('question')
        let original_atQ = original_question.replace(/ /g, '-')
        let question = interaction.options.getString('question').includes("stats") ? interaction.options.getString('question') : `${interaction.options.getString('question')} stats`
        let atQ = question.replace(/ /g, '-')
        var query = atQ
        console.log(query)
        const url = `https://www.statmuse.com/ask/${query}`
        const data = await fetch(url)
        const rawHtml = await data.text()    
        const dom = new JSDOM(rawHtml)
        const image_class_names = [
            'h-32 @lg/hero:max-w-[200px] mt-2 -mb-2 @lg/hero:mt-0 @lg/hero:-mb-3 @lg/hero:-ml-2 self-center @lg/hero:self-end select-none object-contain object-bottom',
            'max-w-[200px] relative z-[1] object-contain object-bottom'
        ]
        const answer_class_names = [
            'flex-1 flex flex-col justify-between text-center @lg/hero:text-left',
            'mb-5 leading-snug'
        ]
        const answer = dom.window.document.getElementsByClassName(answer_class_names[0])[0].textContent
        const image = dom.window.document.getElementsByClassName(image_class_names[0])[0].src

        function displayEmbed(answer_class_num, image_class_num, err, jdom) {
            const answer = jdom.window.document.getElementsByClassName(answer_class_names[answer_class_num])[0].textContent
            const image = "https://www.statmuse.com" + decodeURIComponent(jdom.window.document.getElementsByClassName(image_class_names[image_class_num])[0].src).replace("w=200&h=200&f=webp", "w=512&h=512&f=png")
            console.log(image)
            let embed = new Discord.MessageEmbed();
            if(err) {
                embed
                .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                .setURL(url)
                .setDescription("Something went wrong trying to assess your query. Please try rewording your question.")
                .setThumbnail(image)
                .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            }
            else {
                embed
                .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                .setURL(url)
                .setDescription(answer)
                .setThumbnail(image)
                .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                .setColor('#0099ff')
                if (Math.floor(Math.random() * 100) == 99) {
                    embed.addFields({name: "Enjoying the bot? Leave us a review on top.gg!", value: "https://top.gg/bot/985799424108269569#reviews"})
                }
                interaction.reply({embeds: [embed]})
                return;
            }
        }

        // Scrapes statmuse, grabs the raw html of the website, and converts it to a DOM so you can access it as you would with react or vanilla JS.
        try {
            similarity = stringSimilarity.compareTwoStrings(answer.replace('stats', ''), interaction.options.getString('question')) // Compares the answer to the question; needed because when statmuse doesn't know the answer it tends to just echo back the question in a slightly different form. Simple QoL thing
            if(similarity > 0.7) {
                let newUrl = `https://www.statmuse.com/ask/${original_atQ}`
                let newData = await fetch(newUrl)
                let newrawHtml = await newData.text()
                let newdom = new JSDOM(newrawHtml)
                let newanswer = newdom.window.document.getElementsByClassName(answer_class_names[1])[0].children[0].textContent
                let newsimilarity = stringSimilarity.compareTwoStrings(newanswer.replace('stats', ''), interaction.options.getString('question'))
                if (newsimilarity + 0.1 < similarity) {
                    displayEmbed(1, 1, false, newdom)
                } else { displayEmbed(0, 0, true, dom)}
                return        
            }
            else { displayEmbed(0, 0, false, dom)}
        } catch(e) {
            console.log("hit error")
            displayEmbed(0, 0, true, dom)
        } 
    }
}
