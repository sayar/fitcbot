var builder = require('botbuilder');
var rp = require('request-promise');

/**
 * Find a speaker
 * 
 * Does a keyword search on speaker names to see what presentations can be found
 */
module.exports = [
    function(session, next) {
        builder.Prompts.text(session, 'What\'s the name of the speaker you are looking for?');
    },
    function(session, results, next) {
        session.send('Let me see what I can find about "%s"', results.response);
        session.sendTyping();

        var rp_options = {
            uri: process.env.FITC_API_ROOT + '/services/search/speaker/' + encodeURIComponent(results.response),
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json'
            },
            json: true
        };

        rp(rp_options)
            .then(function(res) {
                var answer = res;

                // if the server generated a message, show it, skip the cards
                if (answer.hasOwnProperty('message') && answer.message.length > 0) {
                    session.send(answer.message);
                    return session.replaceDialog('/', { reprompt: true });
                }

                // check that some presentations were sent back
                if (answer.hasOwnProperty('presentations') && Array.isArray(answer.presentations)) {
                    var presentation_cards = [];
                    var presentations = answer.presentations;
                    var total_presentations = presentations.length;

                    if (total_presentations > 1) {
                        session.send('I found the following talk by ' + answer.speaker_name);
                    } else {
                        session.send('I found the following talks by ' + answer.speaker_name);
                    }

                    for (i = 0; i < total_presentations; i++) {
                        var card = new builder.HeroCard(session)
                            .title(presentations[i].presentation_name)
                            .subtitle(presentations[i].presentation_date)
                            .images([])
                            .buttons([
                                builder.CardAction.openUrl(session, presentations[i].presentation_link, 'View Details')
                            ]);

                        presentation_cards.push(card);
                    }

                    var response = new builder.Message(session)
                        .textFormat(builder.TextFormat.plain)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(presentation_cards);

                    session.send(response);
                } else {
                    session.send('I didn\'t find any presentations based the search for ' + results.response);
                }
                next();
            })
            .catch(function(err) {
                session.send('Something went wrong.');
                next();
            });
    },
    function(session, next) {
        var q = 'Do you want to lookup another speaker?';
        builder.Prompts.choice(session, q, 'Yes|No');
    },
    function(session, results, next) {
        if (results.response && results.response.index === 0) {
            session.replaceDialog('/findSpeaker', { reprompt: true });
        } else {
            next();
        }
    },
    function(session, results, next) {
        session.replaceDialog('/', { reprompt: true });
    }
];