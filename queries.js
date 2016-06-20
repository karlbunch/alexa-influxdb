module.change_code = 1;

var _ = require("lodash");
var moment = require("moment");

queries = {};

queries.temperature = {
    query: "SELECT topic, time, last(d_value) FROM telegraf..mqtt_consumer WHERE topic =~ /sensors.*temperature.*/ group by topic",
    formatResults: function(r) {
        var response = "The current temperatures are\n";

        r[0].forEach(function(row) {
            var parts = row.topic.split('/');

            response += parts[2].replace('inside.', '') + " is " + row.last.toFixed(0) + " degrees.\n";
        });

        console.log("formatResults:", response, "\n");
        return response;
    }
};

queries.temperatures = queries.temperature;

var weather_format = {
    humidity: function(v) {
        return (v * 100).toFixed(0) + ' percent'
    },
    temperature: function(v) {
        return Math.round(v) + ' degrees'
    },
    cloudCover: function(v) {
        return Math.round(v * 100.0) + ' percent'
    },
    windSpeed: function(v) {
        return Math.round(v) + ' miles per hour'
    },
    windBearing: function(v) {
        if (v > 348.75 || v <= 11.25) return "North";
        if (v > 11.25 && v <= 33.75) return "North by North East";
        if (v > 33.75 && v <= 56.25) return "North East";
        if (v > 56.25 && v <= 78.75) return "East by North East";
        if (v > 78.75 && v <= 101.25) return "East";
        if (v > 101.25 && v <= 123.75) return "East by South East";
        if (v > 123.75 && v <= 146.25) return "South East";
        if (v > 146.25 && v <= 168.75) return "South by South East";
        if (v > 168.75 && v <= 191.25) return "South";
        if (v > 191.25 && v <= 213.75) return "South by South West";
        if (v > 213.75 && v <= 236.25) return "South West";
        if (v > 236.25 && v <= 258.75) return "West by South West";
        if (v > 258.75 && v <= 281.25) return "West";
        if (v > 281.25 && v <= 303.75) return "West by North West";
        if (v > 303.75 && v <= 326.25) return "North West";
        if (v > 326.25 && v <= 348.75) return "North by North West";
        return v + " degrees";
    },
    precipProbability: function(v) {
        return Math.round(v * 100.0) + ' percent'
    },
};

var weather_template = _.template("<s>dark skys said ${ago} that it's ${temperature} outside</s>, <s>with ${humidity} humidity</s>, <s>wind of ${windSpeed} from the ${windBearing}</s><s> with ${precipProbability} chance of rain.</s>");

queries.outside = {
    rawQuery: true,
    query: 'SELECT last(value) FROM "forecast.io"..humidity, "forecast.io"..temperature, "forecast.io"..cloudCover, "forecast.io"..precipProbability, "forecast.io"..windSpeed, "forecast.io"..windBearing',
    formatResults: function(r) {
        console.log("r=", JSON.stringify(r[0].series), "\n");

        var weather = {};
	var when = '';

        r[0].series.forEach(function(k) {
            var v = k.values[0][1];

            weather[k.name] = weather_format[k.name] ? weather_format[k.name](v) : v;
	    when = k.values[0][0];
        });

	var ageSeconds = Math.abs(Math.round(moment(when).subtract(moment.now()).valueOf() / 1000.0));

	if (ageSeconds > 86400) {
	    weather.ago = 'a while ago on ' + moment(when).format('MMMM Do YYYY, h:mm a');
	} else {
	    weather.ago = 'at ' + moment(when).format('h:mm a');
	}

        console.log("weather=", weather);

	var response = weather_template(weather);

        console.log("formatResults:", response, "\n");

        return response;
    }
};

module.exports = queries;
