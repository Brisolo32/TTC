const tmi = require('tmi.js');
const TelegramBot = require('node-telegram-bot-api');

const { twitchbotname, oauthtoken, channelname, teletoken, chatid } = require('./config.json');

const bot = new TelegramBot(teletoken, { polling: true });

const client = new tmi.Client({
	options: { debug: false },
    connection: {
        reconnect: true
    },
	identity: {
		username: twitchbotname,
		password: oauthtoken
	},
	channels: [ channelname ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    bot.sendMessage(chatid, `<b>${tags['display-name']}:</b> ${message}`,{parse_mode : "HTML"});
});
		
