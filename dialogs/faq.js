var builder = require('botbuilder');
var request = require('request');

/** 
 * QnA Dialogs
 */

module.exports = [
    function(session) {
        builder.Prompts.text(session, 'Type a question and I\'ll go bug Shawn for the answer.');
    },
    function(session, results, next) {
        session.sendTyping();

        var host = process.env.KB_HOST;
        var kbId = process.env.KB_ID;
        var csSubKey = process.env.CS_SUBKEY;
        request.post({
            url: host + '/knowledgebases/' + kbId + '/generateAnswer',
            headers: {
                'Ocp-Apim-Subscription-Key': csSubKey
            },
            body: JSON.stringify({ question: results.response })
        }, function(error, response, body) {
            var answer = JSON.parse(body).answer;
            session.send(answer);
            next();
        });
    },
    function(session) {
        var q = 'Would you like me to ask Shawn another question?';
        builder.Prompts.choice(session, q, 'Yup|Nope');
    },
    function(session, results, next) {
        if (results.response) {
            if (results.response.index === 0) {
                session.replaceDialog('/faq', { reprompt: true });
            } else if (results.response.index === 1) {
                session.replaceDialog('/', { reprompt: true });
            } else {
                next();
            }
        } else {
            next();
        }
    }
];