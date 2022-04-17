process.env.NTBA_FIX_319 = 1;

const tmi = require('tmi.js');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
var channel = prompt('Channel to listen for messages: ');

const chatId = fs.readFileSync('chatId.txt', 'utf8');
const teletoken = fs.readFileSync('token.txt', 'utf8');

const { twitchbotname, oauthtoken } = require('./config.json');

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

client.once('connected', () => {
	bot.sendMessage(chatId, `<b>Connected to ${channel}</b>`, { parse_mode: 'HTML' });
});

client.on('message', (channel, tags, message, self) => {
    bot.sendMessage(chatid, `<b>${tags['display-name']}:</b> ${message}`,{parse_mode : "HTML"});
});	
