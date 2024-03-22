const Discord = require("discord.js")
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildMessageReactions], messages: { interval: 3600, lifetime: 1800, }, users: { interval: 3600, filter: () => user => user.bot && user.id !== client.user.id, } })
const fs = require("fs");
const path = require('path');

require('dotenv').config();
require("./events/Ready.js")(client);
require("./handlers/PrefixHandler.js")(client);

client.slashCommands = new Discord.Collection();
client.registerdCommands = new Discord.Collection();

client.slashCommands = new Discord.Collection();
client.registeredCommands = new Discord.Collection();

const loadCommands = (folderPath) => {
    const commandFolders = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`${folderPath}/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`${folderPath}/${folder}/${file}`)
            client.slashCommands.set(command.config.name, command);
            client.registeredCommands.set(command.config.name, command.config);
            console.log(`${command.config.name} komudu aktif.`);
        }
    }
}

const loadEvents = () => {
    const Eventsss = path.join(__dirname, '/functions/');
    for (const event of fs.readdirSync(Eventsss).filter(file => file.endsWith(".js"))) {
        const evt = require(`${Eventsss}${event}`);

        if (evt.config.once) {
            client.once(evt.config.name, (...args) => {
                evt.execute(client, ...args);
            });
        } else {
            client.on(evt.config.name, (...args) => {
                evt.execute(client, ...args);
            });
        }
    }
}

const slashCommandsRegister = () => {
    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v10");

    client.once("ready", async () => {
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
        try {
            await rest.put(Routes.applicationCommands(process.env.ID), {
                body: client.registeredCommands.toJSON(),
            }).then(() => {
                console.log(`Toplam komut ${client.registeredCommands.size}`)
            });
        } catch (error) {
            throw error;
        }
    })
};
const commandFolderPath = path.join(__dirname, 'commands/SlashCommands');
loadCommands(commandFolderPath);
loadEvents();
slashCommandsRegister();

require('dotenv').config();
client.on("ready", () => {
require("./database/connect.js")(process.env.MONGODB)
console.log(`MongoDB Başlatıldı.`)
})

client.login(process.env.TOKEN).then(() => {
    console.log(`${process.env.NAME} Bot DC Girdi`);
}).catch((err) => {
    console.log(`${process.env.NAME} Bot DC Giremedi: ${err}`);
});
