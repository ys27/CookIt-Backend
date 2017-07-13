var express = require('express');
var mongojs = require('mongojs');
var sha256 = require('sha256');
var router = express.Router();

var db = require('./db');

//Get All Users
router.get('/findAll', function(req, res, next) {
	console.log(sha256("qwert123"))
	db.users.find(function(err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
});

//Get Individual User
router.get('/find/:_id', function(req, res, next) {
	db.users.findOne({"_id": mongojs.ObjectID(req.params._id)}, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
});

//Insert User
router.put('/signup', function(req, res, next) {
	var newUserInfo = req.body;
	newUserInfo.password = sha256(newUserInfo.password);
	db.users.insert(req.body, function(err) {
		if (err) {
			res.send(err);
		}
	});

});

//Update User
router.put('/update/:_id', function(req, res, next) {
	db.users.update({_id: mongojs.ObjectID(req.params._id)}, {$set: req.body}, function(err) {
		if (err) {
			res.send(err);
		}
	});
});

//Delete User
router.get('/delete/:_id', function(req, res, next) {
	db.users.remove({_id: mongojs.ObjectID(req.params._id)}, function(err) {
		if (err) {
			res.send(err);
		}
	});
})

//Check Login
router.put('/login', function(req, res, next) {
	db.users.findOne({"email": req.body.email}, function(err, user) {
		if (err) {
			res.send(err);
		}
		if (sha256(req.body.password) == user.password) {
			res.send(true);
		}
		else {
			res.send(false);
		}
	});
});

module.exports = router;
