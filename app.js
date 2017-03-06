var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        var q = "Hello! I can answer questions about sessions or general questions or show you a picture of a cute cat?";
        builder.Prompts.choice(session, q, "Session|FAQ|Cute Cats!");
    },
    function(session, results, next) {
        if (results.response) {
            if(results.response.index === 0){
                session.beginDialog('/sessions');
            }
            else if (results.response.index === 1){
                session.beginDialog('/faq');
            }
            else {
                next();
            }
        } else {
           next();
        }
    }, function(session, results, next){
        session.replaceDialog('/');
    }
]);

bot.dialog('/sessions', [
    function(session){
        var q = "What would you like to know? I can answer questions these questions:"
        builder.Prompts.choice(session, q, [
            "What are the next sessions?",
            "What are all the sessions happening right now?",
            "What are the party details?"
        ]);
    },
    function(session, results, next) {
        if (results.response) {
            if(results.response.index === 0){
                //TODO: Write code to answer these questions...
                next();
            }
            else if (results.response.index === 1){
                //TODO: Write code to answer these questions...
                next();
            }
            else if (results.response.index === 2){
                //TODO: Write code to answer these questions...
                next();
            } else {
                next();
            }
        } else {
            next();
        }
    }, 
    function(session) {
        session.endDialog();
    }
]);

bot.dialog('/faq', [
    function(session){
        builder.Prompts.text(session, "What can I answer?");
    },
    function(session, results, next){
        session.sendTyping();

        var host = process.env.KB_HOST;
        var kbId = process.env.KB_ID;
        var csSubKey = process.env.CS_SUBKEY;
        request.post({
            url: host + "/knowledgebases/" + kbId + "/generateAnswer",
            headers: {
                "Ocp-Apim-Subscription-Key": csSubKey
            },
            body: JSON.stringify({question: results.response})
        }, function(error, response, body){
            var answer = JSON.parse(body).answer;
            session.send(answer);
            next();
        });
    }, 
    function(session){
        var q = "Would you like to ask another FAQ question or go back to the main menu?";
        builder.Prompts.choice(session, q, "Yes|Go Back");
    }, 
    function(session, results, next){
         if (results.response) {
            if(results.response.index === 0){
                session.replaceDialog('/faq', {reprompt: true });
            }
            else if (results.response.index === 1){
                session.endDialog();
            } else {
                next();
            }
         } else {
             next();
         }
    }
]);