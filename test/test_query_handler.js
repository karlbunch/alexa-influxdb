'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var QueryHandler = require('../query_handler');

describe('QueryHandler', function() {
    var subject = new QueryHandler();
    describe('#runQuery', function() {
        context('with an invalid query string', function() {
            it('returns an error', function() {
                return expect(subject.runQuery('SELETC INVALID_SYNTAX')).to.be.rejectedWith(Error);
            });
        });
        context('with a valid query string', function() {
            it('returns results', function() {
                return expect(subject.runQuery('SHOW DATABASES').then(function(o) {
                    return o.length > 0;
                })).to.eventually.eq(true);
            });
        });
    });
    describe('#formatResults', function() {
        var example_format = function(r) {
            var response = "The current temperatures are\n";

	    r[0].forEach(function(row) {
	        response += row.topic + " is " + row.last.toFixed(2) + " degrees.\n";
	    });

	    return response;
        };
        var example_results = [
            [{
                time: '2016-06-19T21:15:30Z',
                topic: 'sensors/host1/sensor1/temperature/fmt/json-iotf',
                last: 83.525
            }, {
                time: '2016-06-19T21:15:30Z',
                topic: 'sensors/host2/sensor2/temperature/fmt/json-iotf',
                last: 76.435
            }, {
                time: '2016-06-19T21:15:30Z',
                topic: 'sensors/host3/sensor3/temperature/fmt/json-iotf',
                last: 80.487
            }, {
                time: '2016-06-19T21:15:30Z',
                topic: 'sensors/host4/sensor4/temperature/fmt/json-iotf',
                last: 78.84
            }]
        ];
        context('with four sensors', function() {
            it('returns six lines of output', function() {
                return expect(subject.formatResults(example_format, example_results).split('\n').length).to.eq(6);
            });
        });
    });
});
