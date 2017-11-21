'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');

var APP_ID = undefined;
var SKILL_NAME = "Bitcoin";
var STOP_MESSAGE = "Goodbye!";

var BOT_SAY = 'bitcoin';

exports.handler = function(event, context, callback)
{
	var alexa = Alexa.handler(event, context);
	alexa.APP_ID = APP_ID;
	alexa.registerHandlers(handlers);
	alexa.execute();
};

var handlers = {
	'LaunchRequest': function()
	{
		this.emit('StartIntent');
	},
	'StartIntent': function()
	{
		var speechOutput = 'Hey there! I am ' + BOT_SAY + '! How can I help you?';
		// var reprompt = 'Do not fear! ' + CBOT_SAY + ' is here!';
		// this.emit(':ask', speechOutput, reprompt);
		this.emit(':ask', speechOutput);
	},
	'GetBitcoinValueIntent': function()
	{
		var currencySlot = this.event.request.intent.slots.currency;

		var currency = 'USD';

		var currencyValue;
		if (currencySlot && currencySlot.value)
		{
			currencyValue = currencySlot.value.toLowerCase();
			switch (currencyValue)
			{
				case 'euros':
				case 'eur':
				case 'euro':
					currency = 'EUR';
					break;
				case 'sterling':
				case 'pounds':
				case 'pound':
				case 'gbp':
					currency = 'GBP';
					break;
			}
		}

		var req = https.request({
			host: 'carlos.fyi',
			port: 443,
			path: '/api/cbot.php?method=bitcoinValue',
			method: 'GET'
		},
		res => {
			res.setEncoding('utf8');

			var returnData = '';
			res.on('data', chunk => {
				returnData = returnData + chunk;
			});
			res.on('end', () => {
				var parsedValues = JSON.parse(returnData).values;
				var bitcoinValue = parseFloat(parsedValues.USD);
				var speechOutput = 'A bitcoin is worth ' + bitcoinValue + ' dollars!';
				if (currency === 'EUR')
				{
					bitcoinValue = parseFloat(parsedValues.EUR);
					speechOutput = 'A bitcoin is worth ' + bitcoinValue + ' euros!';
				}
				else if (currency === 'GBP')
				{
					bitcoinValue = parseFloat(parsedValues.GBP);
					speechOutput = 'A bitcoin is worth ' + bitcoinValue + ' pounds!';
				}
				var cardTitle = SKILL_NAME + ' Bitcoin Value (' + currency + ')';
				this.emit(':tellWithCard', speechOutput, cardTitle, speechOutput);
			});
		});
		req.end();
	},
	'AMAZON.HelpIntent': function ()
	{
	   // var HELP_MESSAGE = 'Hi neha, i can get you bitcoin prices in real time.';
		var HELP_MESSAGE = 'I am ' + BOT_SAY + ' and i can get you bitcoin prices in real time.';
		var HELP_REPROMPT = "ask me like current price of bitcoin or Current price of bitcoin in Dollars";
		var speechOutput = HELP_MESSAGE;
		var reprompt = HELP_REPROMPT;
		this.emit(':ask', speechOutput, reprompt);
	},
	'AMAZON.CancelIntent': function ()
	{
		this.emit(':tell', STOP_MESSAGE);
	},
	'AMAZON.StopIntent': function ()
	{
		this.emit(':tell', STOP_MESSAGE);
	}
};
