import https from "https";
import atob from "atob";
export function getChallenge(gameID)
{
    return new Promise(r => https.get("https://kahoot.it/reserve/session/" + gameID, (res) => {
        res.setEncoding("utf8");
        let xKahootToken = res.headers["x-kahoot-session-token"];
        var body = "";

        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            r({
                xKahootToken,
                body
            });
        });
    }));
}

export function solveChallenge(xToken, challenge) {
    var mask = "";
    var preChallenge = `
    let _ = {};
    let me = {};
    _.replace = (string, regex, func)=>{
        let outString = string;
        let match;
        while(match = regex.exec(string)) {
            outString = outString.substr(0, match.index) + func(match["0"], match.index) + outString.substr(match.index+1)
        }
        return outString;
    };
    me.angular = {
        isObject: ()=>false,
        isString: ()=>false,
        isDate: ()=>false,
        isArray: ()=>false,
    };`;

    (() => {
        let t = 0;
        let d = preChallenge + (challenge).replace(/this/g, function (match) {
            t++;
            return (t === 2) ? "me" : match;
          });
        mask = eval(d);
    })();

    mask = toByteArray(mask);
    
    var base64Array = toByteArray(atob(xToken));
    for(var i=0; i<base64Array.length; i++) {
        base64Array[i] ^= mask[i%mask.length];
    }
    return toStringFromBytes(base64Array);
}

function toStringFromBytes(start) {
    var returnStr = "";
    for(var i=0; i<start.length; i++) {
        returnStr += String.fromCharCode(start[i]);
    }
    return returnStr;
}

function toByteArray(start) {
    var returnArray = [];
    for(var i=0; i<start.length; i++) {
        returnArray.push(start.charCodeAt(i));
    }
    return returnArray;
}