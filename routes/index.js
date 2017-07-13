var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

//Get All Users
router.get('/', function(req, res, next) {
	res.render('index.html');
});

module.exports = router;
