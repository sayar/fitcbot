var builder = require('botbuilder');

/**
 * Presentations Dialog
 */
module.exports = [
    function(session) {
        session.send('Please note, I currently am only capable of answering questions about presentations on the day of the event.');
        session.send('I\'m working on this though...if I could just find where I left my power cord...');

        var q = 'I can answer these questions about presentations:';
        builder.Prompts.choice(session, q, [
            'Up next?',
            'On now?',
            'Speaker Search'
        ], {
            maxRetries: 3,
            retryPrompt: 'Ooops, what you wrote is not a valid option, please try again.'
        });
    },
    function(session, results, next) {
        if (results.response) {
            if (results.response.index === 0) {
                session.beginDialog('/nextPresentations');
            } else if (results.response.index === 1) {
                session.beginDialog('/currentPresentations');
            } else if (results.response.index === 2) {
                session.beginDialog('/findSpeaker');
            } else {
                next();
            }
        } else {
            next();
        }
    },
    function(session, results) {
        session.endDialog();
    }
];