var _ = require('lodash');
var express = require('express');

var app = express();

app.get('/', function (req, res) {
	res.send(_.capitalize('Hello world!'))
})

app.listen(8081);