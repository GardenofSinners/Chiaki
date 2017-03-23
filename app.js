var tmi = require('tmi.js');
var fs = require('fs');
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'insertapasswordhere';

var bannedWords = ["view bot"];

var botCooldown = 5.0; //five second cooldown on commands.
var botOnCooldown = false; //boolean variable which indicates whether or not bot is on cooldown.

var botPrefix = "!"; //Bot command prefix eg !commandname

//Bot configuration options which connects it to the twitch servers.
var options = {
	options: {
		debug: true
	},

	connection: {
		cluster: "aws",
		reconnect: true
	},

	identity: {
		username: "twitchbotusername",
		password: "oauth:putyouroauthcodehere"
	},

	channels: ["channelnamehere"] //Default channels the bot will start up in (deprecated)
};

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/web-ui/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
	socket.on('showLogs', function(forChannel,privateKey) {
	fs.readFile(__dirname+'/logs/'+decrypt(forChannel)+'.txt', 'utf8', function (err, data) {
		if (err) {
				console.log(err);
				return;
		}
		io.emit("sendLogs", data);
	});

	});
	
	socket.on('addCustomCommand', function(forChannel, commandCall, commandString) {
		var forChannelDecrypted = decrypt(forChannel);
		if(!containsObject(forChannelDecrypted, connectedToChannels)) return;
		console.log(commandCall + " => "+commandString);
		fs.readFile("customCommands.json", 'utf8', function (err, data) {
		if (err) {
				console.log(err);
				return;
		}
		var obj = JSON.parse(data);
		if(!(forChannelDecrypted in obj)) {
			obj[forChannelDecrypted] = {};
			obj[forChannelDecrypted][commandCall] = commandString;
			fs.writeFile("customCommands.json", JSON.stringify(obj, null, 4), function(err) {
				if(err) throw err;
			});
		} else if((forChannelDecrypted in obj)) {
			obj[forChannelDecrypted][commandCall] = commandString;
			fs.writeFile("customCommands.json", JSON.stringify(obj, null, 4), function(err) {
				if(err) throw err;
			});
		}
		});
		
	});
	
	socket.on('requestPrivateKey', function(forChannel) {
		io.emit('sendPrivateKey', encrypt(forChannel));
	});
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
    


//Would be nice if we could get all of aformentioned options into a config file.

var client = new tmi.client(options);
client.connect();

//This is to be used in the event you call the #channel in a message or command otherwise
//it'll print out #channelnamehere

var fs = require('fs');
var obj;

var connectedToChannels = []; //This will populate using the below function.

function JoinNewChannels() {

	fs.readFile('channels.json', 'utf8', function (err, data) {
	if (err) throw err;
	obj = JSON.parse(data);
	for (i = 0; i < obj["channels"].length; i++) { 
		if(containsObject(obj["channels"][i], connectedToChannels)) continue;
		client.join(obj["channels"][i]);
		connectedToChannels.push(obj["channels"][i]);
	}
});
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function badWordCheck(message) {
	var splitMessage = message.split(" ");
	for (i = 0; i < splitMessage.length; i++) { 
		if(containsObject(splitMessage[i], bannedWords)) return true;
	}
}

function dehash(channel) {
	return channel.replace(/^#/, '');
}

client.on("connected", function() {
	JoinNewChannels();
	setInterval(JoinNewChannels, 10000); //checks for new channels every 10 seconds.
});

//Default command.
var commands = {
	"ping": {
		modOnly: false,
		process: function(channel,user,message) {
			client.say(channel, "Pong!");
		}
	}
}

client.on("chat", function(channel, user, message, self) {

	/*            This logs the chat per channel     */
    var dt = new Date();
    var timestamp = dt.toUTCString();
    	fs.appendFile('logs/'+channel.substring(1)+'.txt',  '\n['+timestamp+'] '+user.username+': ' +message + '\r\n', function (err) {
      	if (err) throw err;
    });

	if(botOnCooldown) {
			console.log("bot on cooldown returning");
			return;
	}
	if(badWordCheck(message)) {
		client.say(channel, "/timeout "+user.username+" 15");
	}
	if(message[0] == botPrefix) {
		var cmdTxt = message.split(" ")[0].substring(botPrefix.length);
		var suffix = message.split(" ");
		var suffix2 = suffix.splice(0,1);
		var cmd = commands[cmdTxt];
		if(cmd === undefined && !CheckForCustomCommands(cmdTxt, dehash(channel),user.username)) return;
		CoolBot();
		var suffixString = suffix+"";
		suffixString = suffixString.replace(","," ");
		cmd.process(channel, user, suffixString.replaceAll(",", " "));
	}
});

	/* 			Thanks people for subbing 			*/
client.on('subscription', function(channel, username) {
        client.say(channel, "Thanks a lot for subscribing: " + username + "! It's greatly appreciated <3");
    });
	/* 			Thanks people for resubbing 		*/
client.on('resub', function(channel, username, months, message) {
	if(months  == 6){
		client.say(channel, username + " has resubscribed for " + months + " months, congratulations!");
	} else {
        client.say(channel, username + " has resubscribed for " + months + " months!");
	}});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.replaceVariables = function(authorName) {
	var niceString = this.replaceAll("{user}","@"+authorName);
	return niceString;
};

function CheckForCustomCommands(cmdTxt,channelName,author) {
fs.readFile('customCommands.json', 'utf8', function (err, data) {
	if (err) throw err;

	obj = JSON.parse(data);
	if(obj[channelName] == undefined) return false;
	if(obj[channelName][cmdTxt] == undefined) return false;
	client.say("#"+channelName,obj[channelName][cmdTxt].replaceVariables(author));
	CoolBot()
	return;
});	
}

function CoolBot() {
	botOnCooldown = true;
	setTimeout(function(){botOnCooldown = false;}, botCooldown*1000);
}

//Security

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password);
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec; 
}



