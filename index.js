const Discord = require("discord.js")
const Client = new Discord.Client();
const SnakeGame = require('./snake-game');
const snakeGame = new SnakeGame(Client);
const HangmanGame = require('./hangman-game');
const hangman = new HangmanGame(Client);
const KFCGame = require('./kfc-game');
const kfcgame = new KFCGame(Client);
const Connect4 = require('./connect4');
const connect4 = new Connect4(Client);
const Maze = require('./maze');
const mazeGame = new Maze(Client);
const bot = new Discord.Client({disableEveryone: true});
const { TOKEN } = "YOUR TOKEN";
const prefix = "tamil "
const Fs = require("fs")

bot.on("ready", async () => {
    console.log(`ready`) // READY
    bot.user.setActivity(`activity`, {type: "PLAYING"}) // ACTIVITY OF YOUR BOT
});

bot.on("message", async (message) => {
    if (message.content.startsWith(prefix)) {
        var args = message.content.substr(prefix.length)
            .toLowerCase()
            .split(" ");
        if (args[0] == "start") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));

            if (UserJSON[message.author.id]) {
                let WarningEmbed = new MessageEmbed();
                WarningEmbed.setTitle("**ERROR**");
                WarningEmbed.setDescription("You already started");
                WarningEmbed.setColor("RANDOM");
                message.channel.send(WarningEmbed);
                return;
            }

            UserJSON[message.author.id] = {
                bal: 0,
                lastclaim: 0,
                lastwork: 0,
                workers: 0,
            }
            Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));

            let SuccessEmbed = new MessageEmbed();
            SuccessEmbed.setTitle("**SUCCESS**");
            SuccessEmbed.setColor("RANDOM");
            SuccessEmbed.setDescription("You have joined the economy! type tamil help to get started");
            message.channel.send(SuccessEmbed);
            return;
        }
        if (args[0] == "daily") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));
            if (Math.floor(new Date().getTime() - UserJSON[message.author.id].lastclaim) / (1000 * 60 * 60 * 24) < 1) {
                let WarningEmbed = new MessageEmbed()
                WarningEmbed.setTitle("**Wait until tomorrow.**");
                WarningEmbed.setDescription("You have claimed today already");
                WarningEmbed.setColor("RANDOM");
                WarningEmbed.setFooter(`wassup dude`, bot.user.displayAvatarURL());
                message.channel.send(WarningEmbed);
                return;
            }
            UserJSON[message.author.id].bal += 500;
            UserJSON[message.author.id].lastclaim = new Date().getTime();
            Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));
            let SuccessEmbed = new MessageEmbed();
            SuccessEmbed.setTitle("**Congratulations!**");
            SuccessEmbed.setDescription("You have claimed a daily reward of 500 ⛄");
            SuccessEmbed.setColor("RANDOM");
            SuccessEmbed.setFooter(`claim another one tomorrow`, bot.user.displayAvatarURL())
            message.channel.send(SuccessEmbed);
            return;
        }
        if (args[0] == "pay") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));
            let Money = args[1];

            if (!Money) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify an amount to give.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }

            if (!UserJSON[message.author.id]) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("You have not started the game yet.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }
            if (isNaN(Money)) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify a number");
                ErrorEmbed.setColor("RANDOM");
                ErrorEmbed.setFooter(`hi me bored.`, bot.user.displayAvatarURL());
                message.channel.send(ErrorEmbed);
                return;
            }
            if (UserJSON[message.author.id].bal < Money) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("You do not have enough money");
                ErrorEmbed.setColor("RANDOM");
                ErrorEmbed.setFooter(`get more money to be rich!`, bot.user.displayAvatarURL());
                message.channel.send(ErrorEmbed);
                return;
            }
            if (Money.indexOf(".") != -1 || Money.indexOf("-") != -1 || Money == 0) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify an integer value greater than 0");
                ErrorEmbed.setColor("RANDOM");
                ErrorEmbed.setFooter(`higher than 0`, message.author.displayAvatarURL());
                message.channel.send(ErrorEmbed);
                return;
            }

            let Mentioned = message.mentions.members.first();
            if (!Mentioned) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please mention a user");
                ErrorEmbed.setColor("RANDOM");
                ErrorEmbed.setFooter(`@user`, message.author.displayAvatarURL());
                message.channel.send(ErrorEmbed);
                return;
            }
            if (!UserJSON[Mentioned.id]) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("That person does not play the game.");
                ErrorEmbed.setColor("RANDOM");
                ErrorEmbed.setFooter(`hi homie`, message.author.displayAvatarURL());
                message.channel.send(ErrorEmbed);
                return;
            }

            UserJSON[message.author.id].bal -= parseInt(Money);
            UserJSON[Mentioned.id].bal += parseInt(Money);

            Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));

            let SuccessEmbed = new MessageEmbed();
            SuccessEmbed.setTitle("**SUCCESS**");
            SuccessEmbed.setDescription("You have given " + Money + " discord coins to " + Mentioned.user.username);
            SuccessEmbed.setFooter(`u are a generous human`, message.author.displayAvatarURL());
            SuccessEmbed.setColor("RANDOM");
            message.channel.send(SuccessEmbed);
        }

        if (args[0] == "bal") {
            // Action Here
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));

            if (!UserJSON[message.author.id]) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("You must be playing the game.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }
            let mentioned = message.mentions.members.first();
            if (mentioned) {
                if (!UserJSON[mentioned.id]) {
                    let ErrorEmbed = new MessageEmbed();
                    ErrorEmbed.setTitle("**ERROR**");
                    ErrorEmbed.setDescription("That person is not playing the game.");
                    ErrorEmbed.setColor("RANDOM");
                    ErrorEmbed.setFooter("do tamil vote", message.author.displayAvatarURL())
                    message.channel.send(ErrorEmbed);
                    return;
                }
                let SuccessEmbed = new MessageEmbed();
                SuccessEmbed.setTitle("**SUCCESS**");
                SuccessEmbed.addField("Balance", UserJSON[mentioned.id].bal);
                SuccessEmbed.setColor("RANDOM");
                SuccessEmbed.setFooter("hi welcome to chilis", bot.user.displayAvatarURL())
                message.channel.send(SuccessEmbed);
                return;
            } else {
                let SuccessEmbed = new MessageEmbed();
                SuccessEmbed.setTitle("**SUCCESS**");
                SuccessEmbed.addField("Balance of ⛄", UserJSON[message.author.id].bal);
                SuccessEmbed.setColor("RANDOM");
                SuccessEmbed.setFooter(`big money`, message.author.displayAvatarURL());
                message.channel.send(SuccessEmbed);
                return;
            }
        }
        if (args[0] == "buy") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));

            if (!UserJSON[message.author.id]) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("You must be playing the game.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }

            let item = args[1];
            let amount = args[2];

            if (!item) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify an item.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }
            if (!amount) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify an amount of ⛄");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }
            if (isNaN(amount)) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify a number");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }
            if (amount == 0 || amount.indexOf("-") != -1 || amount.indexOf(".") != -1) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("Please specify an integer value greater than 0.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }

            switch (item) {
                case "worker":
                    if (7 * parseInt(amount) > UserJSON[message.author.id].bal) {
                        let ErrorEmbed = new MessageEmbed();
                        ErrorEmbed.setTitle("**ERROR**");
                        ErrorEmbed.setDescription("You do not have enough money of ⛄");
                        ErrorEmbed.setColor("RANDOM");
                        message.channel.send(ErrorEmbed);
                        return;
                    }

                    UserJSON[message.author.id].workers += parseInt(amount);
                    UserJSON[message.author.id].bal -= parseInt(amount) * 7;
                    Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));

                    let SuccessEmbed = new MessageEmbed();
                    SuccessEmbed.setTitle("**SUCCESS**");
                    SuccessEmbed.setDescription(`You have bought ${amount} ${item}s.`);
                    SuccessEmbed.setColor("RANDOM");
                    message.channel.send(SuccessEmbed);
                    break;
                case "laptop":
                    if (2000 * parseInt(amount) > UserJSON[message.author.id].bal) {
                      let ErrorEmbed = new MessageEmbed();
                      ErrorEmbed.setTitle("**ERROR**");
                      ErrorEmbed.setDescription("You do not have enough money of ⛄");
                      ErrorEmbed.setColor("RANDOM");
                      message.channel.send(ErrorEmbed);
                      return;
                    }

                    UserJSON[message.author.id].workers += parseInt(amount);
                    UserJSON[message.author.id].bal -= parseInt(amount) * 2000;
                    Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));

                    let SuccessEmbed1 = new MessageEmbed();
                    SuccessEmbed1.setTitle("**SUCCESS**");
                    SuccessEmbed1.setDescription(`You have bought ${amount} ${item}s.`);
                    SuccessEmbed1.setColor("RANDOM");
                    message.channel.send(SuccessEmbed1);
                    break;
                default:
                    let ErrorEmbed = new MessageEmbed();
                    ErrorEmbed.setTitle("**ERROR**");
                    ErrorEmbed.setDescription("The item you are trying to buy does not exist.");
                    ErrorEmbed.setColor("RANDOM");
                    message.channel.send(ErrorEmbed);
                    return;
            }
        }
        if (args[0] == "work") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));

            if (!UserJSON[message.author.id]) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription("You must be playing the game.");
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }

            let deltaTime = Math.floor((new Date().getTime() - UserJSON[message.author.id].lastwork) / (1000 * 60));
            if (deltaTime < 10) {
                let ErrorEmbed = new MessageEmbed();
                ErrorEmbed.setTitle("**ERROR**");
                ErrorEmbed.setDescription(`You can work in ${10 - deltaTime} minutes.`);
                ErrorEmbed.setColor("RANDOM");
                message.channel.send(ErrorEmbed);
                return;
            }

            UserJSON[message.author.id].bal += (UserJSON[message.author.id].workers + 1) * 2850;
            UserJSON[message.author.id].lastwork = new Date().getTime();
            Fs.writeFileSync("./DB/users.json", JSON.stringify(UserJSON));

            let SuccessEmbed = new MessageEmbed();
            SuccessEmbed.setTitle("**SUCCESS**");
            SuccessEmbed.setDescription(`You have earned ${(UserJSON[message.author.id].workers + 1) * 2850} ⛄`);
            SuccessEmbed.setColor("RANDOM");
            message.channel.send(SuccessEmbed);
        }
        if (args[0] == "lb") {
            let UserJSON = JSON.parse(Fs.readFileSync("./DB/users.json"));
            var Sorted = Object.entries(UserJSON).sort((a, b) => b[1].bal - a[1].bal);
            if (Sorted.length > 10) Sorted = Sorted.slice(0, 10);

            var LBString = "";
            Sorted.forEach(user => {
                LBString += `${bot.users.cache.find(u => u.id == user[0])} - ${user[1].bal}\n`;
            });
            var LBEmbed = new MessageEmbed()
                .setTitle("**Leaderboard**")
                .setColor(0x851CC5)
                .setFooter('hi dude', bot.user.displayAvatarURL())
                .setDescription(LBString);
            message.channel.send(LBEmbed);
        }
        if (args[0] == "shop") {
            let items = Object.keys(bot.shop);
            let content = "";
  
            for (var i in items) {
              content += `${items[i]} - :snowman: ${bot.shop[items[i]].cost}\n`
            }
  
            let embed = new MessageEmbed()
            .setTitle("Store")
            .setDescription(content)
            .setColor("RANDOM")
            .setFooter("Do :tamil buy <item> to purchase the item.", message.author.displayAvatarURL())
            return message.channel.send(embed);
        }
    }
});

bot.on("message", async message => {
  
    // CHANNEL PREFIX, DEFINE ARGS AND COMMAND
    if(message.author.bot) return
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    // ARGS AND COMMAND
    const args = message.content.slice(prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();

    // MAZE GAME
    if(message.content === 'tamil maze'){
        mazeGame.newGame(message)
    }

    // CONNECT-4 GAME
    if(message.content === 'tamil connect4'){
        connect4.newGame(message)
    }

    // FRIED CHICKEN GAME
    if (message.content === 'tamil kfc'){
        kfcgame.newGame(message)
    }

    // HANGMAN GAME
    if (message.content === 'tamil hangman'){
        hangman.newGame(message)
    }

    // SNAKE GAME
    if (message.content === 'tamil snake'){
        snakeGame.newGame(message)
    }
}
       
bot.login(TOKEN);
