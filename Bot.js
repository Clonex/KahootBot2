import WebSocket from "ws";
import { getChallenge, solveChallenge } from "./helpers.js";

export default class Bot {
    name = "";
    initalSubscription = true;

    gameID = null;
    openWebSocket = null;

    clientId = 0;
    currentMessageId = 0;
    subscriptionRepliesRecived = 0;

    constructor(name)
    {
        this.name = name;
    }

    async join(gameID)
    {
        let cData = await getChallenge(gameID);
        console.log("Challenge data", cData);
        let token = solveChallenge(cData.xKahootToken ,cData.body.challenge);
        this.gameID = gameID;

        this.openWebSocket = new WebSocket(`wss://kahoot.it/cometd/${this.gameID}/${token}`);

        this.openWebSocket.onopen = function(event) {
            let openObject =  {
                version: "1.0",
                minimumVersion: "1.0",
                channel: "/meta/handshake",
                supportedConnectionTypes: ["websocket","long-polling"],
                advice: {timeout: 60000, interval: 0},
                id: "1",
            };
            this.send(JSON.stringify([openObject]));
        };

        this.openWebSocket.onmessage = this.onMessage;
    }

    onMessage = (event) =>
    {
        var recivedData = JSON.parse(event.data.substring(1,event.data.length-1));
        switch(recivedData.channel) {
            case "/meta/handshake":
                this.Handshake(recivedData);
                break;
            case "/meta/subscribe":
                this.Subscribe(recivedData);
                break;
            case "/meta/connect":
                this.Connect(recivedData);
                break;
            case "/meta/unsubscribe":
                this.Unsubscribe(recivedData);
                break;
            /*case "/service/player":
                this.Player(recivedData);
                break;*/
            case "/service/controller":
                this.Controller(recivedData);
                break;
            default:
                console.log("Bad channel: "+ recivedData);
        }
    }

    /*
        WS helpers
    */
    Handshake(message) {
        this.clientId = message.clientId;
        this.SendSubscription("/service/controller", true);
        this.SendSubscription("/service/player", true);
        this.SendSubscription("/service/status", true);

        this.SendMessage({
            "connectionType": "websocket",
            advice: {timeout: 0},
        }, "/meta/connect");
    }
    Unsubscribe(message) {
        this.subscriptionRepliesRecived++;
        if(this.subscriptionRepliesRecived == 6) {
            this.SendLoginInfo();
        }
    }

    Controller(message) {
        if(message.successful) return;

        if(message.data.type == "loginResponse") {
            if(message.data.error) {
                console.log("Bad name: " + this.name);
                this.name = this.name + "H";
                this.SendLoginInfo();
            } else {
                console.log("Logged in: " + this.uniqueId);
            }
        }
    }

    Subscribe(message) {
        this.subscriptionRepliesRecived++;
        if(this.initalSubscription && this.subscriptionRepliesRecived == 3) {
            this.initalSubscription = false;
            this.subscriptionRepliesRecived = 0;
            
            this.SendSubscription("/service/controller", false);
            this.SendSubscription("/service/player", false);
            this.SendSubscription("/service/status", false);

            this.SendSubscription("/service/controller", true);
            this.SendSubscription("/service/player", true);
            this.SendSubscription("/service/status", true);
            
            this.SendConnectMessage();
        }
        if(this.subscriptionRepliesRecived == 6) {
            this.SendLoginInfo();
        }
    }
    SendSubscription(subscribeTo, subscribe) {
        var message = {subscription: subscribeTo};
        this.SendMessage(message, subscribe ? "/meta/subscribe" : "/meta/unsubscribe");
    }
    SendLoginInfo() {
        var message = {
            data: {
                type: "login",
                gameid: this.gameID,
                host: "kahoot.it",
                name: this.name,
            }
        };
        this.SendMessage(message,"/service/controller");
    };
    Connect(message) {
        if(!message.advice) {
            this.SendConnectMessage();
            return;
        }
        console.log("Error: " + message.advice);
    }
    SendConnectMessage() {
        this.SendMessage({"connectionType": "websocket"}, "/meta/connect");
    }

    SendMessage(message, channel) {
        message.id = this.currentMessageId;
        message.channel = channel;
        
        if(this.clientId != "") {
            message.clientId = this.clientId;
        }

        this.currentMessageId++;
        this.openWebSocket.send("[" + JSON.stringify(message) + "]");
    }

}