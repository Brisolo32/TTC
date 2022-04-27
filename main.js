//  Actually just lied, making a discord bot that sends
//  a message to a specific discord channel is hard as fuck.
//  so yeah, I'm just going to keep updating this
//  and I'll probably add more stuff later.
//       -Brisolo32

process.env.NTBA_FIX_319 = 1;
var answerCallbacks = {};

require('dotenv').config();

// Loads TMI and NTBA
const tmi = require('tmi.js');
const TelegramBot = require('node-telegram-bot-api');

// Defines some variables
const teletoken = 'Your-telegram-token-here';
var twitchbotname = 'Your-Bot-Name-here'
var oauthtoken = 'Your-oauth-token-here'

// Creates a new telegram bot instance
const bot = new TelegramBot(teletoken, { polling: true });
console.log('Ready')

// Some fix, ignore this
bot.on("polling_error", console.log);

bot.on('message', function (message) {
    var callback = answerCallbacks[message.chat.id];
    if (callback) {
        delete answerCallbacks[message.chat.id];
        return callback(message);
    }
});

// Start command
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, `<b>Welcome to TwiTeleChat!</b>\n\nThis bot is still in development and may not work as intended. If you have any questions or concerns, please contact the developer.\n\nOr if you know a bit of coding you can help out by contributing to the project.\n\n<b>Commands:</b>\n<b>/start</b> - Sends this message\n<b>/readchannel</b> - Starts reading the chat from the channel said\n<b>/stopchannel</b> - Stops reading the chat from the channel said\n<b>/github</b> - Shows the github page for this project\n\n<b>Made by Brisolo in Brazil</b>`, { parse_mode: 'HTML' });
})

// Read channel command. Oh boy this is messy 
bot.onText(/\/readchannel/, (msg) => {
	bot.sendMessage(msg.chat.id, `Which channel would you like to read?`).then(function () {
		answerCallbacks[msg.chat.id] = function (answer) {
			// Defines the channel, creates a new TMI client and defines chatId
			const chatId = msg.chat.id;
			var channel = answer.text;
			const client = new tmi.Client({
				options: { debug: true },
				connection: {
					reconnect: true
				},
				identity: {
					username: twitchbotname,
					password: oauthtoken
				},
				channels: [ channel ]
			});

			// Connects to the channel
			client.connect();

			// When the client connects, sends a message to the chat
			bot.sendMessage(msg.chat.id, `<b>Connected to ${channel}</b>`, { parse_mode: 'HTML' });

			client.on('message', (channel, tags, message, self) => {
				bot.sendMessage(chatId, `<b>${tags['display-name']}:</b> ${message}`, { parse_mode: 'HTML' });
			});

			// Stopchannel command
			// This command makes the bot stop reading the chat
			bot.onText(/\/stopchannel/, (msg) => {
				client.disconnect().catch(console.error);
				bot.sendMessage(msg.chat.id, `<b>Stopped reading messages</b>`, { parse_mode: 'HTML' });
			});
		}
	});
})

// Github command. Self explanatory
bot.onText(/\/github/, (msg) => {
	bot.sendMessage(msg.chat.id, `Here it is:\nhttps://github.com/Brisolo32/TTC`, { parse_mode: 'HTML' });
});		
