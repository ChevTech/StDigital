const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-2'});
const ssm = new AWS.SSM();

const params = {
	Names: [ 'PAGE_ACCESS_TOKEN', ],
	WithDecryption: true
}

const parameters = ssm.getParameters(params).promise();

parameters.then(params => {
	const app = express();

	if(params.Parameters.length == 0){
		return Promise.reject('Unable to load aws parameters');	
	}

	app.locals.PAGE_ACCESS_TOKEN = getPageAccessToken(params.Parameters);
	
	app.use(bodyParser.json());
	
	app.get('/', function (req, res) {
		console.log("HelloWorld");
		res.send(_.capitalize('HelloWorld'))
	})
	
	app.post('/webhook', (req, res) => {
		let body = req.body;
		
		if(body.object === 'page') {
			body.entry.forEach(function(entry) {
				let webhook_event = entry.messaging[0];
				console.log(webhook_event);
			});
	
			res.status(200).send('EVENT_RECEIVED');
		} else {
			res.sendStatus(404);
		}
	})
	
	app.get('/webhook', (req, res) => {
		let VARIFY_TOKEN = "asdfghjkl";
	
		let mode = req.query['hub.mode'];
		let token = req.query['hub.verify_token'];
		let challenge = req.query['hub.challenge'];
	
		if(mode && token){
			if(mode === 'subscribe' && token === VARIFY_TOKEN) {
				console.log('WEBHOOK_VERIFIED');
				res.status(200).send(challenge);
			} else {
				res.sendStatus(403);
			}
		}
	
	})
	
	console.log('Starting node server on 8081');
	app.listen(8081);
}, console.error)
.catch(console.error);

function getPageAccessToken(parameters) {	
	const PAGE_ACCESS_TOKEN = parameters.filter((param) => {
		return param.Name == 'PAGE_ACCESS_TOKEN';
	});

	if(PAGE_ACCESS_TOKEN.length != 1){
		throw new Error('Unable to load PAGE_ACCESS_TOKEN');
	}

	return PAGE_ACCESS_TOKEN[0];
}