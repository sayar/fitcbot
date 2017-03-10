var builder = require('botbuilder');

/**
 * Home Dialog
 */

module.exports = [
    function(session, args) {
        var q = 'Hello! I can answer questions about presentations, general questions about the event or show you a picture of a cute cat?';

        if (args && args.reprompt) {
            q = 'Anything else I can help with?';
        }

        builder.Prompts.choice(session, q, 'Presentations|FAQ|Cute Cats!');
    },
    function(session, results, next) {
        if (results.response) {
            if (results.response.index === 0) {
                session.beginDialog('/presentations');
            } else if (results.response.index === 1) {
                session.beginDialog('/faq');
            } else {
                session.beginDialog('/cats');
            }
        } else {
            next();
        }
    },
    function(session, results, next) {
        session.replaceDialog('/');
    }
];