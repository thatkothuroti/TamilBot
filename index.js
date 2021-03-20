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

bot.on("ready", async () => {
    console.log(``) // READY
    bot.user.setActivity(``) // ACTIVITY OF YOUR BOT
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
