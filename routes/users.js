var express = require('express');
var mongojs = require('mongojs');
var sha256 = require('sha256');
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

//Get Individual User
router.get('/:_id', function(req, res, next) {
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
	console.log(newUserInfo)
	newUserInfo.password = sha256(newUserInfo.password);
	db.users.findOne({"email": newUserInfo.email}, function(err, user) {
		if (err) {
			res.send(err);
		}
		if (user == null) {
			console.log("USER DOES NOT EXIST YET")
			db.users.insert(newUserInfo, function(err, user) {
				if (err) {
					res.send(err);
				}
				else {
					console.log("SIGNUP SUCCESSFUL")
					console.log("USER FEEDBACK:", user);
					res.json(user);
				}
			});
		}
		else {
			console.log("EMAIL IN USE");
			res.json({error: "This email is already in use."});
		}
	});
});

router.post('/fbLogin', function(req, res, next) {
	var newUserInfo = req.body;
	console.log(newUserInfo);
	db.users.findOne({"email": newUserInfo.email}, function(err, user) {
		if (err) {
			res.send(err);
		}
		if (user == null) {
			console.log("USER DOES NOT EXIST YET")
			db.users.insert(newUserInfo, function(err, user) {
				if (err) {
					res.send(err);
				}
				else {
					console.log("SIGNUP SUCCESSFUL")
					console.log("USER FEEDBACK:", user);
					res.json(user);
				}
			});
		}
		else {
			res.json(user);
		}
	});
});

//Update User
router.put('/:_id', function(req, res, next) {
	db.users.update({_id: mongojs.ObjectID(req.params._id)}, {$set: req.body}, function(err) {
		if (err) {
			res.send(err);
		}
		console.log(req.body);
		res.send("updated user" + req.params._id);
	});
});

//Delete User
router.delete('/:_id', function(req, res, next) {
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
		else if (user != null){
			if (sha256(req.body.password) == user.password) {
				console.log("LOGIN SUCCESSFUL")
				res.json(user);
			}
			else if (!user.password) {
				console.log("FACEBOOK LOGIN")
				res.json({error: "Log in using Facebook."});
			}
			else {
				console.log("WRONG PASSWORD")
				res.json({error: "Wrong Password"});
			}
		}
		else {
			console.log("NOT AN EXISTING USER")
			res.json({error: "Not an existing user"});
		}
	});
});

module.exports = router;
