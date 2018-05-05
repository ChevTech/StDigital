const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-2'});
const ssm = new AWS.SSM();

const facebook_api = {
	getProfile(PSID, PAGE_ACCESS_TOKEN) { return `https://graph.facebook.com/v2.6/${PSID}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}` }
}

const params = {
	Names: [ 'PAGE_ACCESS_TOKEN', 'permissions' ],
	WithDecryption: true
}

const parameters = ssm.getParameters(params).promise();

parameters.then(params => {
	const app = express();
	
	if(params.Parameters.length == 0){
		return Promise.reject('Unable to load aws parameters');	
	}

	app.locals.PAGE_ACCESS_TOKEN = getParameter(params.Parameters, 'PAGE_ACCESS_TOKEN');
	app.locals.permissions = getParameter(params.Parameters, 'permissions');

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
				processWebhookEvent(webhook_event);
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

function getParameter(parameters, key) {	
	const parameter = parameters.filter((param) => {
		return param.Name == key;
	});

	if(parameter.length != 1){
		throw new Error(`Unable to load ${key}`);
	}

	return parameter[0];
}

async function processWebhookEvent(webhook_event){
	const PAGE_ACCESS_TOKEN = app.locals.PAGE_ACCESS_TOKEN.value;
	const permissions = app.locals.permissions.split(',');
	const { first_name, last_name } = await fetch(facebook_api.getProfile(webhook_event.sender.id), app.locals.PAGE_ACCESS_TOKEN);
	console.log(userProfile);

	if(permissions.includes(`${first_name} ${last_name}`)){
		console.log('fetching google image');
	}

	return;
}