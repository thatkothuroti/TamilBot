const Discord = require('discord.js');

const WIDTH = 7;
const HEIGHT = 7;
const gameBoard = [];

const reactions = { "1️⃣": 1, "2️⃣": 2, "3️⃣": 3, "4️⃣": 4, "5️⃣": 5, "6️⃣": 6, "7️⃣": 7 }

class Connect4 {
    constructor() {
        this.gameEmbed = null;
        this.inGame = false;
        this.redTurn = true;
    }

    gameBoardToString() {
        let str = "| . 1 | . 2 | 3 | . 4 | . 5 | 6 | . 7 |\n"
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += "|" + gameBoard[y * WIDTH + x];
            }
            str += "|\n";
        }
        return str;
    }

    newGame(msg) {
        if (this.inGame)
            return;

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                gameBoard[y * WIDTH + x] = "⚪";
            }
        }

        this.inGame = true;
        const embed = new Discord.MessageEmbed()
            .setColor(0x851CC5)
            .setTitle('Connect-4')
            .setDescription(this.gameBoardToString())
            .addField('திருப்பம்:', this.getChipFromTurn())
            .setFooter('Credits go to Turkey dev!')
            .setTimestamp();

        msg.channel.send(embed).then(emsg => {
            this.gameEmbed = emsg;
            Object.keys(reactions).forEach(reaction => {
                this.gameEmbed.react(reaction);
            });

            this.waitForReaction();
        });
    }

    step() {
        this.redTurn = !this.redTurn;
        const editEmbed = new Discord.MessageEmbed()
            .setColor(0x851CC5)
            .setTitle('Connect-4')
            .setDescription(this.gameBoardToString())
            .addField('திருப்பம்:', this.getChipFromTurn())
            .setFooter('Credits go to Turkey dev!')
            .setTimestamp();
        this.gameEmbed.edit(editEmbed);

        this.waitForReaction();
    }

    gameOver(winner) {
        this.inGame = false;
        const editEmbed = new Discord.MessageEmbed()
            .setColor(0x851CC5)
            .setTitle('Connect-4')
            .setDescription("விளையாட்டு முடிவு அடைந்தது! " + this.getWinnerText(winner))
            .setFooter('Credits go to Turkey dev!')
            .setTimestamp();
        this.gameEmbed.edit(editEmbed);
        this.gameEmbed.reactions.removeAll();
    }

    filter(reaction, user) {
        return Object.keys(reactions).includes(reaction.emoji.name) && user.id !== this.gameEmbed.author.id;
    }

    waitForReaction() {
        this.gameEmbed.awaitReactions((reaction, user) => this.filter(reaction, user), { max: 1, time: 300000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();
                const column = reactions[reaction.emoji.name] - 1;
                let placedX = -1;
                let placedY = -1;

                for (let y = HEIGHT - 1; y >= 0; y--) {
                    const chip = gameBoard[column + (y * WIDTH)];
                    if (chip === "⚪") {
                        gameBoard[column + (y * WIDTH)] = this.getChipFromTurn();
                        placedX = column;
                        placedY = y;
                        break;
                    }
                }

                reaction.users.remove(reaction.users.cache.filter(user => user.id !== this.gameEmbed.author.id).first().id).then(() => {
                    if (placedY == 0)
                        this.gameEmbed.reactions.cache.get(reaction.emoji.name).remove();
                        
                    if (this.hasWon(placedX, placedY)) {
                        this.gameOver(this.getChipFromTurn());
                    }
                    else if (this.isBoardFull()) {
                        this.gameOver("tie");
                    }
                    else {
                        this.step();
                    }
                });
            })
            .catch(collected => {
                this.gameOver("timeout");
            });
    }

    getChipFromTurn() {
        return this.redTurn ? "🔴" : "🟡";
    }

    hasWon(placedX, placedY) {
        const chip = this.getChipFromTurn();

        //Horizontal Check
        const y = placedY * WIDTH;
        for (var i = Math.max(0, placedX - 3); i <= placedX; i++) {
            var adj = i + y;
            if (i + 3 < WIDTH) {
                if (gameBoard[adj] === chip && gameBoard[adj + 1] === chip && gameBoard[adj + 2] === chip && gameBoard[adj + 3] === chip)
                    return true;
            }
        }

        //Verticle Check
        for (var i = Math.max(0, placedY - 3); i <= placedY; i++) {
            var adj = placedX + (i * WIDTH);
            if (i + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH] === chip && gameBoard[adj + (2 * WIDTH)] === chip && gameBoard[adj + (3 * WIDTH)] === chip)
                    return true;
            }
        }

        //Ascending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY + i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH + 1] === chip && gameBoard[adj + (2 * WIDTH) + 2] === chip && gameBoard[adj + (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }

        //Descending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY - i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
                if (gameBoard[adj] === chip && gameBoard[adj - WIDTH + 1] === chip && gameBoard[adj - (2 * WIDTH) + 2] === chip && gameBoard[adj - (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }

        return false;
    }

    isBoardFull() {
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                if (gameBoard[y * WIDTH + x] === "⚪")
                    return false;
        return true;
    }

    getWinnerText(winner) {
        if (winner === "🔴" || winner === "🟡")
            return winner + " வெற்றி பெற்றுள்ளான்!";
        else if (winner == "போட்டி சமநிலை")
            return "இது ஒரு டை!";
        else if (winner == "நேரம் முடிந்தது")
            return "விளையாட்டு முடிக்கப்படாமல் போனது :(";
    }
}

module.exports = Connect4;
