var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

//Get All Users
router.get('/', function(req, res, next) {
	db.users.find(function(err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
});

module.exports = router;