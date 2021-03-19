const Discord = require("discord.js");

const WIDTH = 9;
const HEIGHT = 6;
const gameBoard = [];
const chicken = { x: 1, y: 1 };

class KFCGame {
    constructor() {
        this.SnakeGame = [{ x: 5, y: 5 }];
        this.snakeLength = 1;
        this.score = 0;
        this.gameEmbed = null;
        this.inGame = false;
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                gameBoard[y * WIDTH + x] = "🟪";
            }
        }
    }

    gameBoardToString() {
        let str = ""
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (x == chicken.x && y == chicken.y) {
                    str += "<:kfcPixel:809255111351074846>"; // EMOJI FOR APPLE
                    continue;
                }

                let flag = true;
                for (let s = 0; s < this.snake.length; s++) {
                    if (x == this.snake[s].x && y == this.snake[s].y) {
                        str += "<:rickrolled:805260839610220562>"; // EMOJI FOR SNAKE
                        flag = false;
                    }
                }

                if (flag)
                    str += gameBoard[y * WIDTH + x];
            }
            str += "\n";
        }
        return str;
    }

    isLocInSnake(pos) {
        return this.snake.find(sPos => sPos.x == pos.x && sPos.y == pos.y);
    };

    newAppleLoc() {
        let newApplePos = { x: 0, y: 0 };
        do {
            newApplePos = { x: parseInt(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
        } while (this.isLocInSnake(newApplePos))

        chicken.x = newApplePos.x;
        chicken.y = newApplePos.y;
    }

    newGame(msg) {
        if (this.inGame)
            return;

        this.inGame = true;
        this.score = 0;
        this.snakeLength = 1;
        this.snake = [{ x: 5, y: 5 }];
        this.newAppleLoc();
        const embed = new Discord.MessageEmbed()
            .setColor(0xDA4BD6)
            .setTitle('கோழி விளையாட்டு')
            .setAuthor(`Get Rick Astley to the chicken as fast you could!`)
            .setDescription(this.gameBoardToString())
            .setFooter(`Credits go to TurkeyDev and Bot made by SincerelyBap`)
            .setTimestamp();

        msg.channel.send(embed).then(emsg => {
            this.gameEmbed = emsg;
            this.gameEmbed.react('⬅️');
            this.gameEmbed.react('⬆️');
            this.gameEmbed.react('⬇️');
            this.gameEmbed.react('➡️');

            this.waitForReaction();
        });
    }

    step() {
        if (chicken.x == this.snake[0].x && chicken.y == this.snake[0].y) {
            this.score += 1;
            this.snakeLength++;
            this.newAppleLoc();
        }

        const KFCEmbed = new Discord.MessageEmbed()
            .setColor(0xDA4BD6)
            .setTitle('கோழி விளையாட்டு')
            .setDescription(this.gameBoardToString())
            .setFooter(`Credits go to TurkeyDev and Bot made by SincerelyBap`)
            .setTimestamp();
        this.gameEmbed.edit(KFCEmbed);

        this.waitForReaction();
    }

    gameOver() {
        this.inGame = false;
        const lastEmbed = new Discord.MessageEmbed()
            .setColor(0xDA4BD6)
            .setTitle('கோழி விளையாட்டு')
            .setDescription(`விளையாட்டு முடிவு அடைந்தது!\nSCORE: ` + this.score)
            .setFooter(`Credits go to TurkeyDev and Bot made by SincerelyBap`)
            .setTimestamp();
        this.gameEmbed.edit(lastEmbed);

        this.gameEmbed.reactions.removeAll()
    }

    filter(reaction, user) {
        return ['⬅️', '⬆️', '⬇️', '➡️'].includes(reaction.emoji.name) && user.id !== this.gameEmbed.author.id;
    }

    waitForReaction() {
        this.gameEmbed.awaitReactions((reaction, user) => this.filter(reaction, user), { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                const snakeHead = this.snake[0];
                const nextPos = { x: snakeHead.x, y: snakeHead.y };
                if (reaction.emoji.name === '⬅️') {
                    let nextX = snakeHead.x - 1;
                    if (nextX < 0)
                        nextX = WIDTH - 1;
                    nextPos.x = nextX;
                }
                else if (reaction.emoji.name === '⬆️') {
                    let nextY = snakeHead.y - 1;
                    if (nextY < 0)
                        nextY = HEIGHT - 1;
                    nextPos.y = nextY;
                }
                else if (reaction.emoji.name === '⬇️') {
                    let nextY = snakeHead.y + 1;
                    if (nextY >= HEIGHT)
                        nextY = 0;
                    nextPos.y = nextY;
                }
                else if (reaction.emoji.name === '➡️') {
                    let nextX = snakeHead.x + 1;
                    if (nextX >= WIDTH)
                        nextX = 0;
                    nextPos.x = nextX;
                }

                reaction.users.remove(reaction.users.cache.filter(user => user.id !== this.gameEmbed.author.id).first().id).then(() => {
                    if (this.isLocInSnake(nextPos)) {
                        this.gameOver();
                    }
                    else {
                        this.snake.unshift(nextPos);
                        if (this.snake.length > this.snakeLength)
                            this.snake.pop();

                        this.step();
                    }
                });
            })
            .catch(collected => {
                this.gameOver();
            });
    }
}

module.exports = KFCGame;
