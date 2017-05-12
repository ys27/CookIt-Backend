var express = require('express');
var mongojs = require('mongojs');
var bcrypt = require('bcrypt');
var router = express.Router();

var db = require('./db');

//Get All Users
router.get('/find/all', function(req, res, next) {
	db.users.find(function(err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
});

//Get Individual User
router.get('/find/:_id', function(req, res, next) {
	db.users.findOne({_id: req.params._id}, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
});

//Get Individual User's recipes
router.get('/findRecipes/:_id', function(req, res, next) {
	db.users.findOne({_id: req.params._id}, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user.recipes);
	});
});

//Insert User
router.get('/add', function(req, res, next) {
	bcrypt.hash(req.body.password, 10, function(err, hash) {
		req.body.password = hash;
	});
	db.users.insert(req.body, function(err) {
		if (err) {
			res.send(err);
		}
	});
	
});

//Update User
router.get('/update/:_id', function(req, res, next) {
	db.users.update({_id: req.params._id}, {$set: req.body}, function(err) {
		if (err) {
			res.send(err);
		}
	});
});

//Delete User
router.get('/delete/:_id', function(req, res, next) {
	db.users.remove({_id: req.params._id}, function(err) {
		if (err) {
			res.send(err);
		}
	});
})

//Check Login
router.get('/login/:_id', function(req, res, next) {
	db.users.findOne({_id: req.params._id}, function(err, user) {
		if (err) {
			res.send(err);
		}
		bcrypt.compare(req.body.password, user.password, function(err, res) {
			if (res) {
				res.send(1);
			}
			else {
				res.send(0);
			}
		});
	});
})

module.exports = router;