//	Actually just lied, making a discord bot that sends
//  a message to a specific discord channel is hard as fuck.
//  so yeah, I'm just going to keep updating this
//  and I'll probably add more stuff later.
//       -Brisolo32

"use strict";
process.env.NTBA_FIX_319 = 1;

// Loads TMI and NTBA
const { EventEmitter, once } = require('events');
const tmi = require('tmi.js');
const tmiUtils = require('tmi.js/lib/utils');
const TelegramBot = require('node-telegram-bot-api');

// Defines the telegram token
const teletoken = 'Your-Telegram-Token-Here';

// Creates a new telegram bot instance and a tmi client
const bot = new TelegramBot(teletoken, { polling: true });
const twChatEmitter = new EventEmitter();
const telegramEmitter = new EventEmitter();
const twChatListeners = new Map();

const client = new tmi.client({
	options: { 
		debug: true,
		skipMembership: true
	},
})

client.connect().catch(console.error);

// Defines removeChannel function
const removeChannel = channel => {
	if (twChatEmitter.listenerCount(channel) === 0) {
		client.part(channel);
	}
}

console.log('Ready')

// Some fix, ignore this
bot.on("polling_error", console.log);

// Defines the message listener
client.on('message', (channel, tags, message, self) => {
	if (self) return
	twChatEmitter.emit(channel, { tags, message });
});

bot.on('message', msg => {
	const { id: chatId } = msg.chat;
	telegramEmitter.emit(chatId, msg);
})

// Start command
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, `<b>Welcome to TwiTeleChat!</b>\n\nThis bot is still in development and may not work as intended. If you have any questions or concerns, please contact the developer.\n\nOr if you know a bit of coding you can help out by contributing to the project.\n\n<b>Commands:</b>\n<b>/start</b> - Sends this message\n<b>/readchannel</b> - Starts reading the chat from the channel said\n<b>/stopchannel</b> - Stops reading the chat from the channel said\n<b>/github</b> - Shows the github page for this project\n\n<b>Made by Brisolo in Brazil</b>`, { parse_mode: 'HTML' });
})

// Read channel command. Oh boy this is messy 
bot.onText(/\/readchannel (.+)/, async (msg, match) => {
	const { id: chatId } = msg.chat;
	if (twChatListeners.has(chatId)) {
		await bot.sendMessage(chatId, `Already listening to a channel, use /stopchannel first!`)
	}
		// Defines the a lot of stuff (thx Alca) also this is black magic
		try {
			const signal = new AbortController();
			const timeout = setTimeout(() => signal.abort(), 20000);
			const command = match;
			const [ answer ] = command.slice(1);
			clearTimeout(timeout);
			const channel = tmiUtils.channel(answer);
			const l = {
				channel,
				listener({ tags, message }) {
					const name = tags['display-name'] || tags.username;
					bot.sendMessage(chatId, `<b>${name}:</b> ${message}`, { parse_mode: 'HTML' });
				},
				stop() {
					removeChannel(channel);
					twChatEmitter.removeListener(channel, l.listener);
					twChatListeners.delete(chatId);
				}
			};
			twChatEmitter.on(channel, l.listener);
			twChatListeners.set(chatId, l);
			await bot.sendMessage(chatId, `Now listening to ${channel}!`);
			if(!client.userstate[ channel ]) {
				client.join(channel);
			}
		} catch(err) {
			if(err instanceof Error && err.name === 'AbortError') {
				bot.sendMessage(chatId, 'Timeout, cancelling.');
				return;
			}
			if(twChatListeners.has(chatId)) {
				twChatListeners.get(chatId).stop();
			}
			console.error(err);
			bot.sendMessage(chatId, 'Something went wrong...');
		}
	});

	// Stopchannel command
	// This command makes the bot stop reading the chat
	bot.onText(/\/stopchannel/, msg => {
		const { id: chatId } = msg.chat;
		if (twChatListeners.has(chatId)) {
			twChatListeners.get(chatId).stop();
		}
		else if (!twChatListeners.has(chatId)) {
			bot.sendMessage(chatId, `I am not listening to any channel, use /readchannel first!`)
		}
		bot.sendMessage(msg.chat.id, `<b>Stopped reading messages</b>`, { parse_mode: 'HTML' });
}) 

// Github command. Self explanatory
bot.onText(/\/github/, (msg) => {
	bot.sendMessage(msg.chat.id, `Here it is:\nhttps://github.com/Brisolo32/TTC`, { parse_mode: 'HTML' });
});		
