import Bot from "./Bot.js";

export default class Kahoot {
    gameID = false;
    prefix = "";
    bots = [];

    constructor(gameID, botAmount = 1, prefix = "")
    {
        this.gameID = gameID;
        this.prefix = prefix;

        this.setupBots(botAmount)
    }

    setupBots(botAmount)
    {
        for(let i = 0; i < botAmount; i++)
        {
            setTimeout(() => {
                let bot = new Bot(`${this.prefix}_${i}`);
                bot.join(this.gameID);
                bot.setQuestionListener((data) => {
                    let questions = data.quizQuestionAnswers[data.questionIndex];
                    let answer = Math.floor(Math.random()*questions);
                    
                    bot.answerQuestion(answer);
                });
                this.bots.push(bot);
            }, 35 * i);
        }
    }
}