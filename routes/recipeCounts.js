var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

var seenRecipePoints = 1;
var usedRecipePoints = 5;

//Get All Recipe Counts
router.get('/', function(req, res, next) {
	db.recipeCounts.find(function(err, recipeCounts) {
		if (err) {
			res.send(err);
		}
		res.json(recipeCounts);
	});
});

//Get Individual Recipe Count
router.get('/:recipeId', function(req, res, next) {
	db.recipeCounts.findOne({"recipeId": req.params.recipeId}, function(err, recipeCount) {
		if (err) {
			res.send(err);
		}
		res.json(recipeCount);
	});
});

//Insert New or increment count
router.put('/seen/:recipeId', function(req, res, next) {
	db.recipeCounts.findOne({"recipeId": req.params.recipeId}, function(err, recipeCount) {
		if (err) {
			res.send(err);
		}
		else {
			if (recipeCount == null) {
				db.recipeCounts.insert(
		            {
		                recipeId: req.params.recipeId,
		                recipeCount: seenRecipePoints
		            }
		        );
			}
			else {
				db.recipeCounts.update({"recipeId": req.params.recipeId}, {
		            $inc: {
		                recipeCount: seenRecipePoints
		            }
		        });
			}
			res.send("seen");
		}
	});
});

router.put('/used/:recipeId', function(req, res, next) {
    db.recipeCounts.update({"recipeId": req.params.recipeId}, {
        $inc: {
            recipeCount: usedRecipePoints - seenRecipePoints
        }
    });
	res.send("used");
});

router.put('/unused/:recipeId', function(req, res, next) {
    db.recipeCounts.update({"recipeId": req.params.recipeId}, {
        $inc: {
            recipeCount: seenRecipePoints - usedRecipePoints
        }
    });
	res.send("unused");
});

//Reset Recipe Count
router.put('/reset/:recipeId', function(req, res, next) {
	db.recipeCounts.remove({"recipeId": req.params.recipeId});
	res.send("reset counts for: " + req.params.recipeI);
});

//Reset All Recipe Counts
router.put('/resetAll/', function(req, res, next) {
	db.recipeCounts.remove({});
	res.send("reset counts for all");
});

module.exports = router;
