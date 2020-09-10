// App Setup
const {Client, MessageEmbed, MessageAttachment} = require("discord.js");
const {readFileSync, writeFileSync, fstat} = require("fs");
const fetch = require("node-fetch");
const util = require('minecraft-server-util');
require("dotenv").config();

let servers = JSON.parse(readFileSync("./data/servers.json"));

// Discord.js
const bot = new Client();

bot.on("ready", () => {console.log(`${bot.user.tag} is ready to go!`); bot.user.setActivity("for .status", {type: "WATCHING"})});

bot.on("message", message => {
    if (message.author.bot || message.channel.type !== "text") return;

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.splice(1);

    if (cmd === `.status`) {
        if (!servers[message.guild.id]) return message.channel.send(text("An administrator must add an IP for this server first.", "#e74c3c"));

        fetch(`https://api.mcsrvstat.us/2/${servers[message.guild.id]}`)
        .then(res => res.json())
        .then(json => {
            fetch(`https://api.minetools.eu/query/${process.env.SERVER_IP}`)
            .then(res => res.json())
            .then(response => {
                let players;

                if (response.Playerlist.length === 0) {
                    players = "No Players"
                } else {
                    players = response.Playerlist.join(", ");
                }

                if (json.online) {
                    let embed = new MessageEmbed()
                    .setTitle("Server Status")
                    .setColor("#2ecc71")
                    .setThumbnail()
                    .addField("Status", "Online", true)
                    .addField("Player Count", `${response.Players}/${response.MaxPlayers}`, true)
                    .addField("Version", response.Version, true)
                    .addField("Online Players", players)
                    .setFooter(`IP: ${servers[message.guild.id]}`)
                    .setTimestamp(Date.now());
    
                    message.channel.send(embed);
                } else {
                    let embed = new MessageEmbed()
                    .setTitle("Server Status")
                    .setColor("#e74c3c")
                    .addField("Status", "Offline", true)
                    .addField("Player Count", `0/0`, true)
                    .addField("Version", "Unknown", true)
                    .setFooter(`IP: ${servers[message.guild.id]}`)
                    .setTimestamp(Date.now());
    
                    message.channel.send(embed);
                }
            });
        });
    }

    if (cmd === `.setip`) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(text("Permission Denied!", "#e74c3c"));

        let ip = args[0];
        if (!ip) return message.channel.send(text("Please provide an IP!", "#e74c3c"));

        servers[message.guild.id] = ip;
        writeFileSync("./data/servers.json", JSON.stringify(servers, null, 2), err => {if (err) return console.error(err);});

        message.channel.send(text("**IP Set!** `"+ip+"`"));
    }
});

bot.login(process.env.BOT_TOKEN);

// Functions
function text(text, color = "#3498db") {
    return new MessageEmbed()
    .setDescription(text)
    .setColor(color);
}