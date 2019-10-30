import Kahoot from "./src/Kahoot.js";
if(process.argv.length > 3)
{
    let kahoot = new Kahoot(process.argv[2], process.argv[3] , process.argv[4]||"");
}else{
    console.log(`Arguments needed! Usage:
    yarn start <ID> <amountOfBots> [prefix=""]
    `);
}