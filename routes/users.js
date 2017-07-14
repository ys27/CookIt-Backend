var express = require('express');
var mongojs = require('mongojs');
var sha256 = require('sha256');
var router = express.Router();

var db = require('./db');

//Get All Users
router.get('/findAll', function(req, res, next) {
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
router.post('/signup', function(req, res, next) {
	var newUserInfo = req.body;
	console.log("NEWUSERINFO",newUserInfo);
	newUserInfo.password = sha256(newUserInfo.password);
	db.users.findOne({"email": newUserInfo.email}, function(err, user) {
		if (err) {
			res.send(err);
		}
		if (user == null) {
			db.users.insert(newUserInfo, function(err) {
				if (err) {
					res.send(err);
				} else {
					res.json(user);
				}
			});
		}
		else {
			res.json({error: "This email is already in use."});
		}
	});
});

//Update User
router.put('/update/:_id', function(req, res, next) {
	db.users.update({_id: mongojs.ObjectID(req.params._id)}, {$set: req.body}, function(err) {
		if (err) {
			res.send(err);
		}
		console.log(req.body);
		res.send("updated user" + req.params._id);
	});
});

//Delete User
router.get('/delete/:_id', function(req, res, next) {
	db.users.remove({_id: mongojs.ObjectID(req.params._id)}, function(err) {
		if (err) {
			res.send(err);
		}
		res.send("deleted user" + req.params._id);
	});
})

//Check Login
router.post('/login', function(req, res, next) {
	db.users.findOne({"email": req.body.email}, function(err, user) {
		if (err) {
			res.send(err);
		}
		else {
			if (sha256(req.body.password) == user.password) {
				res.json(user);
			}
			else {
				res.json({});
			}
		}
	});
});

module.exports = router;
