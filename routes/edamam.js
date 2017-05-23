var request = require('request');
var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

var querystring = require('querystring');
var https = require('https');

var app_id = '92e8e386';
var app_key = '6d76b47efaeb85aba24ff109d9d82982';
var host = `https://api.edamam.com/search?app_id=${app_id}&app_key=${app_key}`;

//Get 20 Popular RecipesQQQQ
router.get('/popular', function(req, res, next) {
	var keywords = "&q=popular";
	var limit = "&from=0&to=20";
	request({
		uri: host + keywords + limit,
		method: "GET"
	}, (error, response, body) => {
		var responseContainer = [];
		var bodyJSON = JSON.parse(body);

		bodyJSON.hits.forEach(function(recipeItem)
		{
				responseContainer.push({
					image: recipeItem.recipe.image,
					label: recipeItem.recipe.label,
					uri: recipeItem.recipe.uri,
					healthLabels: recipeItem.recipe.healthLabels,
				});
		});

		console.log(bodyJSON);

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
	var requestURL = host + keywords + limit + diet + health + calories;
	request({
		uri: requestURL,
		method: "GET"
	}, (error, response, body) => {
		res.send(body)
	})
});

router.get('/find/:id', function(req, res, next) {
	var recipeURI = `&r=http://www.edamam.com/ontologies/edamam.owl%23recipe_${req.params.id}`;
	request({
		uri: host + recipeURI,
		method: "GET"
	}, (error, response, body) => {
		res.send(body)
	})
})

var testData = {
	keywords: ["turkey"],
	limit: 1,
	diet: "low-fat",
	health: "",
	calories: {
		lower: 100,
		upper: 2000
	}
}

router.get('/findTest', function(req, res, next) {
	var keywords = "";
	for (var i=0; i<testData.keywords.length; i++) {
		keywords += `&q=${testData.keywords[i]}`;
	}
	var limit = testData.limit ? `&from=0&to=${testData.limit}` : "";
	var diet = testData.diet ? `&diet=${testData.diet}` : "";
	var health = testData.health ? `&health=${testData.health}` : "";
	var calories = "";
	if (testData.calories) {
		if (testData.calories.lower) {
			calories = `&calories=gte%20${testData.calories.lower}`;
			calories += testData.calories.upper ? `,%20lte%20${testData.calories.upper}` : "";
		}
		else if (testData.calories.upper) {
			calories = `&calories=lte%20${testData.calories.upper}`;
		}

	}
	var requestURL = host + keywords + limit + diet + health + calories;
	request({
		uri: requestURL,
		method: "GET"
	}, (error, response, body) => {
		res.send(body)
	})
});

module.exports = router;
