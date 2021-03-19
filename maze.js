const Discord = require("discord.js");

const WIDTH = 9;
const HEIGHT = 6;
const gameBoard = [];
const apple = { x: 1, y: 1 };
const block = { x: 3, y: 2 };
const block2 = { x: 2, y: 3 };

class Maze {
    constructor() {
        this.Maze = [{ x: 5, y: 5 }];
        this.mazeLength = 1;
        this.score = 0;
        this.gameEmbed = null;
        this.inGame = false;
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                gameBoard[y * WIDTH + x] = "🔳";
            }
        }
    }

    gameBoardToString() {
        let str = ""
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (x == apple.x && y == apple.y) {
                    str += "🍫";
                    continue;
                }

                if (x == block.x && y == block.y) {
                    str += "❎";
                    continue;
                }

                if (x == block2.x && y == block2.y) {
                    str += "❎";
                    continue;
                }


                let flag = true;
                for (let s = 0; s < this.snake.length; s++) {
                    if (x == this.snake[s].x && y == this.snake[s].y) {
                        str += "<:rickrolled:805260839610220562>";
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

        apple.x = newApplePos.x;
        apple.y = newApplePos.y;
    }

    newBlockLoc() {
        let newBlockPos = { x: 0, y: 0 };
        do {
            newBlockPos = { x: parseInt(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
        } while (this.isLocInSnake(newBlockPos))

        block.x = newBlockPos.x;
        block.y = newBlockPos.y;
    }

    newBlock2Loc() {
        let newBlock2Pos = { x: 0, y: 0 };
        do {
            newBlock2Pos = { x: parseFloat(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
        } while (this.isLocInSnake(newBlock2Pos))

        block2.x = newBlock2Pos.x;
        block2.y = newBlock2Pos.y;
    }

    newGame(msg) {
        if (this.inGame)
            return;

        this.inGame = true;
        this.score = 0;
        this.snakeLength = 1;
        this.snake = [{ x: 5, y: 5}];
        this.newAppleLoc();
        this.newBlockLoc();
        const newEmbed = new Discord.MessageEmbed()
            .setColor(0x868186)
            .setTitle('பிரமை!!')
            .setDescription(this.gameBoardToString())
            .setFooter('பிரமை!')
            .setTimestamp();

        msg.channel.send(newEmbed).then(emsg => {
            this.gameEmbed = emsg;
            this.gameEmbed.react('⬅️');
            this.gameEmbed.react('⬆️');
            this.gameEmbed.react('⬇️');
            this.gameEmbed.react('➡️');

            this.waitForReaction();
        });
    }

    step() {
        if (apple.x == this.snake[0].x && apple.y == this.snake[0].y) {
            this.score += 1;
            this.snakeLength++;
            this.newAppleLoc();
        }

        const editEmbed = new Discord.MessageEmbed()
            .setColor(0x868186)
            .setTitle('பிரமை!!')
            .setDescription(this.gameBoardToString())
            .setFooter(`பிரமை!`)
            .setTimestamp();
        this.gameEmbed.edit(editEmbed);

        this.waitForReaction();
    }

    gameOver() {
        this.inGame = false;
        const editEmbed = new Discord.MessageEmbed()
            .setColor(0x868186)
            .setTitle('பிரமை!!')
            .setDescription(`Maze Game finished!\nSCORE: ` + this.score)
            .setFooter(`பிரமை!`)
            .setTimestamp();
        this.gameEmbed.edit(editEmbed);

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

module.exports = Maze;
