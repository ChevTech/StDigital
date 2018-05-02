var _ = require('lodash');
var express = require('express');

var app = express();

app.get('/', function (req, res) {
	res.send(_.capitalize('HelloWorld, aws CI/CD pipeline is configured for continuous deployment'))
})

app.listen(8081);