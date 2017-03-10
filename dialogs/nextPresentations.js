var builder = require('botbuilder');
var rp = require('request-promise');

/**
 * Next presentations
 * 
 * Hit up the api to try and find what talks are next.
 */
module.exports = [
    function(session, results, next) {
        session.send('Nice to see you planning ahead. Hang on while I figure out what\'s next.');
        session.sendTyping();

        var rp_options = {
            uri: process.env.FITC_API_ROOT + '/services/search/schedule/next',
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

                    if (total_presentations > 0) {
                        var talks = total_presentations > 1 ? 'some talks' : 'one talk';
                        session.send('I found ' + talks + ' coming up for you at ' + answer.time_slot);
                    } else {
                        session.send('Sorry, I could not find any more presentations on the schedule right now.');
                        next();
                    }

                    for (i = 0; i < total_presentations; i++) {
                        var presentation = presentations[i];
                        var card = new builder.HeroCard(session)
                            .title(presentation.presentation_name)
                            .text('Starts at ' + presentation.presentation_start_time + ' in ' + presentation.presentation_location)
                            .images([])
                            .buttons([
                                builder.CardAction.openUrl(session, presentation.presentation_link, 'View Details')
                            ]);

                        presentation_cards.push(card);
                    }

                    var response = new builder.Message(session)
                        .textFormat(builder.TextFormat.plain)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(presentation_cards);

                    session.send(response);
                } else {
                    session.send('I failed to find anything on the schedule.');
                }
                next();
            })
            .catch(function(err) {
                session.send('Something went wrong.');
                console.log(err);
                next();
            });
    },
    function(session, results, next) {
        session.replaceDialog('/', { reprompt: true });
    }
];