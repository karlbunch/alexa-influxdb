'use strict';
module.change_code = 1;

var Alexa = require('alexa-app');
var app = new Alexa.app('influxdb');
var QueryHandler = require('./query_handler');
var queries = require('./queries');
var _ = require('lodash');

var defaultPrompt = 'I can tell you about ' + _.keys(queries).join(',') + '.';

app.launch(function(req, res) {
    res.say(defaultPrompt).reprompt(defaultPrompt).shouldEndSession(false);
});

app.intent('influxdb', {
        'slots': {
            'Question': 'AMAZON.LITERAL'
        },
        'utterances': [
            '{|for} {|current|last} {-|Question} {|reading|status}'
        ]
    },
    function(req, res) {
        var query = req.slot('Question');

        if (_.isEmpty(query)) {
            res.say("I didn't hear what query you wanted, " + defaultPrompt).reprompt(defaultPrompt).shouldEndSession(false);
            return true;
        }

        var q = queries[query];

        if (!q) {
            res.say("I didn't understand what query you wanted, " + defaultPrompt).reprompt(defaultPrompt).shouldEndSession(false);
            return true;
        }

        var queryHandler = new QueryHandler();

        queryHandler.runQuery(q.query, q.rawQuery).then(function(results) {
            console.log("Query Results: ", results);

            console.log("q=", q);

            res.say(queryHandler.formatResults(q.formatResults, results)).send();
        }).catch(function(err) {
            console.log("*ERROR* Query[" + query + "] = ", err, "\nfor:", q);
            res.say("I'm sorry your query failed for some reason, " + defaultPrompt).reprompt(defaultPrompt).shouldEndSession(false).send();
        });

        return false;
    }
);

module.exports = app;
