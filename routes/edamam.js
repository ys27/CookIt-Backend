var request = require('request');
var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

var querystring = require('querystring');
var https = require('https');

var app_id = '92e8e386';
var app_key = '6d76b47efaeb85aba24ff109d9d82982';
var host = `https://api.edamam.com/search?app_id=${app_id}&app_key=${app_key}&q=chicken`;

//Get 20 Popular RecipesQQQQ
router.get('/popular', function(req, res, next) {
	var limit = "&from=0&to=20";
	request({
		uri: host + limit,
		method: "GET"
	}, (error, response, body) => {
		var responseContainer = [];
		var bodyJSON = JSON.parse(body);

		bodyJSON.hits.forEach(function(recipeItem)
		{
				responseContainer.push({
					imageURL: recipeItem.recipe.image,
					name: recipeItem.recipe.label,
					recipeURI: recipeItem.recipe.uri,
					healthLabels: recipeItem.recipe.healthLabels,
				});
		});

		res.send(JSON.stringify(responseContainer));
	})
});

router.get('/find', function(req, res, next) {
	var keywords = "";
	for (var i=0; i<req.body.keywords.length; i++) {
		keywords += `&q=${req.body.keywords[i]}`;
	}
	var limit = req.body.limit ? `&from=0&to=${req.body.limit}` : "";
	var diet = req.body.diet ? `&diet=${req.body.diet}` : "";
	var health = req.body.health ? `&health=${req.body.health}` : "";
	var calories = "";
	if (req.body.calories) {
		if (req.body.calories.lower) {
			calories = `&calories=gte%20${req.body.calories.lower}`;
			calories += req.body.calories.upper ? `,%20lte%20${req.body.calories.upper}` : "";
		}
		else if (req.body.calories.upper) {
			calories = `&calories=lte%20${req.body.calories.upper}`;
		}

	}
	request({
		uri: host + keywords + limit + diet + health + calories,
		method: "GET"
	}, (error, response, body) => {
		res.send(body)
	})
});

module.exports = router;
