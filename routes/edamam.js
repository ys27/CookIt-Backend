var request = require('request');
var express = require('express');
var mongojs = require('mongojs');
var ml = require('machine_learning');
var router = express.Router();

var db = require('./db');

var async = require('async');
var querystring = require('querystring');
var https = require('https');

var app_id = ['92e8e386', '878b5cbc', 'dd6cc1a2', 'caa454c9'];
var app_key = ['6d76b47efaeb85aba24ff109d9d82982', 'd247acdf0e5f3b1eb9d8abf463c13a90', '1d45d1eeecb8e543724a96078d534dde', '2089d97e74613d7cc80402ebcdc5c0e5'];
var host = `https://api.edamam.com/search?app_id=`;
var keyToggle = 0;

router.get('/find/keyword/:keyword', function(req, res, next) {
	var keywords = `&q=${req.params.keyword}`;
	var limit = req.query.start ? "&from=" + req.query.start +  "&to=" + (parseInt(req.query.start) + 5) : "&from=0&to=20";
	request({
		uri: host + `${app_id[keyToggle]}&app_key=${app_key[keyToggle]}` + keywords + limit,
		method: "GET"
	}, (error, response, body) => {
		console.log(host + `${app_id[keyToggle]}&app_key=${app_key[keyToggle]}` + keywords + limit);
		toggleKey();
		if (!error && !body.startsWith("<")) {
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
			sortByCount(res, responseContainer);
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
		uri: host + `${app_id[keyToggle]}&app_key=${app_key[keyToggle]}` + keywords + limit,
		method: "GET"
	}, (error, response, body) => {
		toggleKey();
		if (!error && !body.startsWith("<")) {
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
			sortByCount(res, responseContainer);
			// res.send(JSON.stringify(responseContainer));
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
	var limit = req.query.start ? "&from=" + req.query.start +  "&to=" + (parseInt(req.query.start) + 5) : "&from=0&to=20";
	var diet = "";
	for (var i=0; i<req.body.diet ? req.body.diet.length : 0; i++) {
		diet += `&diet=${req.body.diet[i]}`;
	}
	var health = "";
	for (var i=0; i<req.body.health ? req.body.health.length : 0; i++) {
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
	var requestURL = host + `${app_id[keyToggle]}&app_key=${app_key[keyToggle]}` + keywords + limit + diet + health + calories;
	request({
		uri: requestURL,
		method: "GET"
	}, (error, response, body) => {
		toggleKey();
		if (!error && !body.startsWith("<")) {
			var responseContainer = [];
			var bodyJSON = JSON.parse(body);

			bodyJSON.hits.forEach(function(recipeItem)
			{
					responseContainer.push({
						// uri: recipeItem.recipe.uri,
						// label: recipeItem.recipe.label,
						// image: recipeItem.recipe.image,
						// url: recipeItem.recipe.url,
						// shareAs: recipeItem.recipe.shareAs,
						// yield: recipeItem.recipe.yield,
						// dietLabel: recipeItem.recipe.dietLabel,
						// healthLabel: recipeItem.recipe.healthLabel,
						// ingredientLines: recipeItem.recipe.ingredientLines,
						// calories: recipeItem.recipe.calories,
						image: recipeItem.recipe.image,
						label: recipeItem.recipe.label,
						uri: recipeItem.recipe.uri,
						healthLabels: recipeItem.recipe.healthLabels,
						calories: recipeItem.recipe.calories / recipeItem.recipe.yield
					});
			});
			// res.send(JSON.stringify(responseContainer));
			sortByCount(res, responseContainer);
		}
		else {
			return error;
		}
	})
});

router.get('/find/:id', function(req, res, next) {
	var recipeURI = `&r=http://www.edamam.com/ontologies/edamam.owl%23recipe_${req.params.id}`;
	request({
		uri: host + `${app_id[keyToggle]}&app_key=${app_key[keyToggle]}` + recipeURI,
		method: "GET"
	}, (error, response, body) => {
		toggleKey();
		if (!error && !body.startsWith("<")) {
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
			res.json({error: "No return from API"});
		}
	})
});

function sortByCount(res, recipes) {
	console.log("beginning sorting")
	var countArray = [];
	async.series([
	    function(callback) {
			async.eachOfSeries(recipes, function (recipe, i, next) {
				var index = recipes[i].uri.indexOf("recipe_") + 7;
				var recipeId = recipes[i].uri.substring(index);
				db.recipeCounts.findOne({"recipeId": recipeId}, function (err, recipeCount) {
					if (err) {
						res.send(err);
					}
					if (recipeCount != null) {
						countArray.push({
							recipeCount: recipeCount,
							index: i
						});
					}
					i++;
					next();
				});
			}, function (err) {
			    console.log("Done Reading");
				callback(null)
			});
	    },
	    function(callback) {
			countArray.sort(function(a,b) {
				return b.recipeCount.recipeCount - a.recipeCount.recipeCount;
			});
	        callback(null);
	    },
	    function(callback) {
			async.eachOfSeries(countArray, function (count, i, next) {
				recipes.move(countArray[i].index+i, i);
				i++;
				next();
			}, function (err) {
			    console.log("Done Sorting");
				callback(null, recipes)
			});
	    }
	],
	function(err, recipes) {
		res.send(recipes[2])
		// return recipes[2];
	});
};

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this;
};

function toggleKey() {
	keyToggle = (keyToggle+1) % app_id.length;
}


module.exports = router;
