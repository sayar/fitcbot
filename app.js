/**
 * FITC Chat Bot
 * Authors: Rami Sayar and Rick Mason
 * 
 * Note: Lots of node BotBuilder samples here: https://github.com/Microsoft/BotBuilder-Samples/tree/master/Node
 */

var restify = require('restify');
var builder = require('botbuilder');
var dotenv = require('dotenv');

// Load ENV variables
dotenv.load();

/**
 * Bot Setup
 */

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var home = require('./dialogs/home');
var cats = require('./dialogs/cats');
var presentations = require('./dialogs/presentations');
var findSpeaker = require('./dialogs/findSpeaker');
var currentPresentations = require('./dialogs/currentPresentations');
var nextPresentations = require('./dialogs/nextPresentations');
var faq = require('./dialogs/faq');

bot.dialog('/', home);
bot.dialog('/cats', cats);
bot.dialog('/presentations', presentations);
bot.dialog('/findSpeaker', findSpeaker);
bot.dialog('/currentPresentations', currentPresentations);
bot.dialog('/nextPresentations', nextPresentations);
bot.dialog('/faq', faq);