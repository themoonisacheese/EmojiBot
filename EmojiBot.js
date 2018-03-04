//https://discordapp.com/oauth2/authorize?client_id=315859331138453504&scope=bot&permissions=371776
const Discord = require('discord.js');
var util = require('util');
var fs = require('fs');

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = JSON.parse(fs.readFileSync('./secrets.json', 'utf-8')).token;

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.once('ready', () => {

	var now = new Date();
	var datestring = now.toString();
  	console.log('[' + datestring + '] I am ready!');
	bot.user.setPresence({ game: { name: ':help | :list', type: 0 } });
	writeList();
	setInterval(writeList, 1000*60*60*24);
});

bot.on('message', message =>{
	if (message.author.bot) {
		return;
	}
	if(message.content === ":invite"){
		message.author.send("https://discordapp.com/oauth2/authorize?client_id=315859331138453504&scope=bot&permissions=371776");
		return;
	}
	if(message.content === "<@315859331138453504> help" || message.content === ":help"){
		message.author.send("How to use me?\n\
Simply type your message with the name of an emote (custom or not) that is available to the bot (that means it has to be in the server that provides the emote)\n\
For example, typing `I really like :themoon:` will have your message replaced by \"I really like "+bot.emojis.find(val => val.name ==="themoon").toString() +"\"\n\
To see all my emotes, visit http://themoonisachee.se/emojibot or type `:list`\n\
This obviously works with any emote the bot knows\n\
To get an invite link, say `:invite`\n\
Message my owner @Themoonisachee.se on https://discord.gg/YC9raqG if you have further questions");
		return;
	}else if(message.content === ":list"){
		message.channel.send("http://themoonisachee.se/emojibot");
		return;
	}else{
		if (message.content.includes(":")) {
			var didsomething = false;
			var lastemote = false;
			var ignore = 0;

			var splitted = message.content.split(":");
			var newmessage = new String();

			for (var i = 0; i < splitted.length; i++) {
				if (i>0 && splitted[i-1].charAt(splitted[i-1].length-1) === '<') {
					ignore = 2;
				}
				if (i>0 && splitted[i-1].charAt(splitted[i-1].length-1) !== ' ') {
					ignore = 1;
				}

				if (ignore>0) {
					newmessage+=":"+splitted[i];
					ignore--;
				}else {
					if (!(splitted[i].includes(" ")) && splitted[i].length >=2) {
						var emojiToSend = bot.emojis.find(val => val.name === splitted[i]);
						if (emojiToSend) {
							didsomething = true;
							lastemote = true;
							newmessage += emojiToSend.toString();
						}else {
							if (lastemote || i == 0) {
								newmessage += splitted[i];
								lastemote = false;
							}else {
								newmessage += ":" + splitted[i];
								lastemote = false;
							}
						}
					}else{
						if (lastemote || i == 0) {
							newmessage += splitted[i];
							lastemote = false;
						}else {
							newmessage += ":" + splitted[i];
							lastemote = false;
						}
					}
				}
			}
			if (didsomething) {
				if (message.member.nickname) {
					message.channel.send(message.member.nickname + ": " + newmessage)
					.catch(errorHandler);
				}else {
					message.channel.send(message.author.username + ": " + newmessage)
					.catch(errorHandler);
				}

				console.log(message.author.username+ ": " + newmessage);

				message.delete()
				.catch(function (e) {
					console.log("Error while deleting a message");
				});
			}
		}
	}
});


process.on('uncaughtException', errorHandler);

var html = "";




function writeList(){
	var now = new Date();
	console.log("["+ now.toString() +"] Saving the list to html");

	html = "<!DOCTYPE html>\n\
<html>\n\
	<head>\n\
		<meta charset=\"UTF-8\">\n\
	  <title>EmojiBot Emotes</title>\n\
	</head>\n\
	<body>\n\
"
	var emotes = bot.emojis.sort();
	emotes.forEach(addEmoji);

	html+= "</body>\n\
</html>"

	//fs.writeFileSync('./http-server/public/emojibot/index.html', html, 'utf-8');
	console.log("Done!");

}

function addEmoji(emoji){
	html+= "<img src=\""+ emoji.url +"\" alt=\""+ emoji.name +"\" style=\"width:32px;height:32px;\"> --- " + emoji.name + "<br>\n";
}

function errorHandler(e){
	var now = new Date();
	var datestring = now.toString();
	fs.appendFileSync('emoji.log', datestring + " 		" + e.message + "\n");
}

bot.login(token);
