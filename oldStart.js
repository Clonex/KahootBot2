const getToken = require('./ManageTokens');

if(process.argv.length > 3)
{
    getToken.Start(process.argv[2], process.argv[3]);
    setInterval(getToken.RequestAction, 20);
}else{
    console.log("Arguments needed! Usage:\nyarn start ID amountOfBots");
}