# Chiaki
A Node-JS based twitch/irc bot.

##Summary:

This is a node-js based IRC/Twitch Chat bot that has been developed for the use of helping my favorite streamers. (If you do make this for someone elses channel I recommend asking them for permission, or you may get banned.)

##Features:

1. Web-UI (You will need to make your own web-interface)
2. Custom Commands are easily made.
3. aes-256-ctr encryption. (Not really being used at the moment).
4. Bot spam cooldown function
5. Chat logging.
6. Join new channels.
7. Banned Word Checker.
8. Thanks subscribers and resubscribers.
9. Custom command variables.

##To be implemented:

1. Quick way to change/add/remove sub messages.
2. Add more features(to be decided)

##Installation:

1. Download LTS Version of [NodeJS](https://nodejs.org/dist/v6.10.1/node-v6.10.1-x64.msi) from [NodeJS main page](https://nodejs.org/en/)
2. Download files from github and extract them to wherever you like.
3. Open app.js in your favorite editor eg Notepad++, Sublime, Atom etc.
4. Edit the following sections and replace them with your own information.

Open app.js and locate the following and change it accordingly to your bot's information. You can find your oauth:code by going to [TwitchApps (You can click on me to go there)](https://twitchapps.com/tmi/)

```username: "twitchbotusername",
	 password: "oauth:putyouroauthcodehere"```
   
This is not really needed at the moment but I will recommend changing the following information to something that suits you.

```password = 'insertapasswordhere';```

Now. Close app.js and open up channels.json. In here simply change `"channels": ["channelnamehere"]` to whatever channel you want to join.

Save and close channels.json and open up customCommands.json and as with the previous file replace `channelnamehere` with your channel name (the one you wish to join). Change `commandname` to the command name you want and `command text here` to whatever you want it to say. More commands can be added by typing the same line and adding a command to the end of the previous line.

Finally, after you've got all your files edited to your liking. Open up CMD and go to the location of your files. eg C:\Users\YourName\Desktop\TwitchChatBot. After this type the following commands.

```npm install --save express tmi.js fs crypto http socket.io``` to install all the required nodejs modules required to run this program.

##Issues

1. At the current time: NONE
