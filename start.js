import Kahoot from "./Kahoot.js";
import http from "http";
if(process.argv.length > 3)
{
    let kahoot = new Kahoot(process.argv[2], process.argv[3] , process.argv[4]||"");
}else{
    console.log(`Arguments needed! Usage:
    yarn start <ID> <amountOfBots> [prefix=""]
    `);
}
/*const getToken = require('./ManageTokens');

if(process.argv.length > 3)
{
    getToken.Start(process.argv[2], process.argv[3]);
    setInterval(getToken.RequestAction, 20);
}else{
    console.log("Arguments needed! Usage:\nyarn start ID amountOfBots");
}*/