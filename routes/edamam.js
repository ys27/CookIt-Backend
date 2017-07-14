var request = require('request');
var express = require('express');
var mongojs = require('mongojs');
var ml = require('machine_learning');
var router = express.Router();

var db = require('./db');

var querystring = require('querystring');
var https = require('https');

var app_id = '92e8e386';
var app_key = '6d76b47efaeb85aba24ff109d9d82982';
var host = `https://api.edamam.com/search?app_id=${app_id}&app_key=${app_key}`;


router.get('/find/keyword/:keyword', function(req, res, next) {
	var keywords = `&q=${req.params.keyword}`;
	var limit = req.query.start ? "&from=" + req.query.start +  "&to=" + (parseInt(req.query.start) + 5) : "&from=0&to=20";
	request({
		uri: host + keywords + limit,
		method: "GET"
	}, (error, response, body) => {
		if (!error) {
			var bodyJSON = JSON.parse(body);
			// sortByCount(bodyJSON);
			res.send(bodyJSON);
		}
		else {
			return error;
		}
	})
});

//Get 20 Popular RecipesQQQQ
router.get('/find/popular/:keyword', function(req, res, next) {
	var keywords = `&q=${req.params.keyword}`;
	var limit = req.query.start ? "&from=" + req.query.start +  "&to=" + (parseInt(req.query.start) + 5) : "&from=0&to=20";
	request({
		uri: host + keywords + limit,
		method: "GET"
	}, (error, response, body) => {
		if (!error) {
			var responseContainer = [];
			var bodyJSON = JSON.parse(body);

			bodyJSON.hits.forEach(function(recipeItem)
			{
					responseContainer.push({
						image: recipeItem.recipe.image,
						label: recipeItem.recipe.label,
						uri: recipeItem.recipe.uri,
						healthLabels: recipeItem.recipe.healthLabels,
						calories: recipeItem.recipe.calories / recipeItem.recipe.yield
					});
			});
			res.send(JSON.stringify(responseContainer));
		}
		else {
			return error;
		}
	})
});

router.put('/find', function(req, res, next) {
	var keywords = "";
	for (var i=0; i<req.body.keywords.length; i++) {
		keywords += `&q=${req.body.keywords[i]}`;
	}
	var limit = req.body.limit ? `&from=0&to=${req.body.limit}` : "";
	for (var i=0; i<req.body.diet.length; i++) {
		diet += `&diet=${req.body.diet[i]}`;
	}
	for (var i=0; i<req.body.health.length; i++) {
		health += `&health=${req.body.health[i]}`;
	}
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
		if (!error) {
			var responseContainer = [];
			var bodyJSON = JSON.parse(body);

			bodyJSON.hits.forEach(function(recipeItem)
			{
					responseContainer.push({
						uri: recipeItem.recipe.uri,
						label: recipeItem.recipe.label,
						image: recipeItem.recipe.image,
						url: recipeItem.recipe.url,
						shareAs: recipeItem.recipe.shareAs,
						yield: recipeItem.recipe.yield,
						dietLabel: recipeItem.recipe.dietLabel,
						healthLabel: recipeItem.recipe.healthLabel,
						ingredientLines: recipeItem.recipe.ingredientLines,
						calories: recipeItem.recipe.calories,
					});
			});
			res.send(JSON.stringify(responseContainer));
		}
		else {
			return error;
		}
	})
});

router.get('/find/:id', function(req, res, next) {
	var recipeURI = `&r=http://www.edamam.com/ontologies/edamam.owl%23recipe_${req.params.id}`;
	request({
		uri: host + recipeURI,
		method: "GET"
	}, (error, response, body) => {
		if (!error) {
			var bodyJSON = JSON.parse(body)
			res.send(JSON.stringify({
				uri: bodyJSON[0].uri,
				label: bodyJSON[0].label,
				image: bodyJSON[0].image,
				url: bodyJSON[0].url,
				shareAs: bodyJSON[0].shareAs,
				yield: bodyJSON[0].yield,
				dietLabel: bodyJSON[0].dietLabel,
				healthLabel: bodyJSON[0].healthLabel,
				ingredientLines: bodyJSON[0].ingredientLines,
				calories: bodyJSON[0].calories,
			}));
		}
		else {
			return error;
		}
	})
});

function sortByCount(json) {
	console.log("sorting")
	var countArray = [];
	var recipes = json.hits;
	for (var i=0; i<recipes.length; i++) {
		var index = recipes[i].recipe.uri.indexOf("recipe_") + 7;
		var recipeId = recipes[i].recipe.uri.substring(index);
		db.recipeCounts.findOne({"recipeId": recipeId}, function (err, recipeCount) {
			if (err) {
				res.send(err);
			}
			if (recipeCount != null) {
				console.log(recipeCount)
				countArray.push({
					recipeCount: recipeCount,
					index: i
				});
			}
		});
	}
	countArray.sort(function(a,b) {
		return a.recipeCount.recipeCount - b.recipeCount.recipeCount;
	});
	console.log(countArray)
};

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};


module.exports = router;
