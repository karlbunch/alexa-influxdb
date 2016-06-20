'use strict';

var config = require('./config');
var influx = require('influx');
var client = influx(config.influx);

function QueryHandler() {}

QueryHandler.prototype.runQuery = function(q, rawQuery) {
    return new Promise(function(resolve, reject) {
	if (rawQuery) {
	    client.queryRaw(q, function(err, results) {
		if (!err) {
		    resolve(results)
		} else {
		    reject(err)
		}
	    });
	} else {
	    client.query(q, function(err, results) {
		if (!err) {
		    resolve(results)
		} else {
		    reject(err)
		}
	    });
	}
    });
};

QueryHandler.prototype.formatResults = function(formatter, results) {
    return formatter(results);
};

module.exports = QueryHandler;
