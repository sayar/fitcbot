var builder = require('botbuilder');
var rp = require('request-promise');

/**
 * Current presentations
 * 
 * Hit up the api to try and find what talks are currently happening
 */
module.exports = [
    function(session, results, next) {
        var insults = [
            'Did you sleep in?',
            'Drank too much last night?',
            'Have something against the current speaker?',
            'You mean you didn\'t preplan your whole day like I did?',
            'Did you lose your schedule?'
        ];

        session.send(insults[Math.floor(Math.random() * insults.length)]);
        session.send('One sec, I\'ll figure out what\'s on now.');
        session.sendTyping();

        var rp_options = {
            uri: process.env.FITC_API_ROOT + '/services/search/schedule/current',
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
                        var talks = total_presentations > 1 ? 'talks' : 'talk';
                        session.send('I found ' + total_presentations + ' ' + talks + ' happening right now.');
                    } else {
                        session.send('Sorry, I could not find any presentations on the schedule right now.');
                        next();
                    }

                    for (var i = 0; i < total_presentations; i++) {
                        var presentation = presentations[i];
                        var card = new builder.HeroCard(session)
                            .title(presentation.presentation_name)
                            .text(presentation.presentation_start_time + ' in ' + presentation.presentation_location)
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
                next();
            });
    },
    function(session, results, next) {
        session.replaceDialog('/', { reprompt: true });
    }
];