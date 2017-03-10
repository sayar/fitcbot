var builder = require('botbuilder');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Get some cat photos!
 */
module.exports = [
    function(session) {
        session.send('You want cats? I\'ve got cats!');
        session.sendTyping();

        var random = getRandomInt(1, 10000); // note: api request was getting cached, adding random param fixed it

        var card = new builder.HeroCard(session)
            .title('Cute Cat!')
            .subtitle('Shawn loves cats.')
            .images([
                builder.CardImage.create(session, 'http://thecatapi.com/api/images/get?format=src&type=gif&size=med&rando=' + random)
            ]);

        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);

        card = null;

        session.replaceDialog('/', { reprompt: true });
    }
];