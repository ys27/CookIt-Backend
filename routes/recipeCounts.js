var express = require('express');
var mongojs = require('mongojs');
var router = express.Router();

var db = require('./db');

var seenRecipePoints = 1;
var usedRecipePoints = 5;

//Get All Recipe Counts
router.get('/getAll', function(req, res, next) {
	db.recipeCounts.find(function(err, recipeCounts) {
		if (err) {
			res.send(err);
		}
		res.json(recipeCounts);
	});
});

//Get Individual Recipe Count
router.get('/get/:recipeId', function(req, res, next) {
	db.recipeCounts.findOne({"recipeId": req.params.recipeId}, function(err, recipeCount) {
		if (err) {
			res.send(err);
		}
		res.json(recipeCount);
	});
});

//Insert New or increment count
router.get('/seen/:recipeId', function(req, res, next) {
    if (db.recipeCounts.findOne({"recipeId": req.params.recipeId}) != null) {
        db.recipeCounts.update({"recipeId": req.params.recipeId}, {
            $inc: {
                recipeCount: seenRecipePoints
            }
        });
    }
    else {
        db.recipeCounts.insert(
            {
                recipeId: req.params.recipeId,
                recipeCount: seenRecipePoints
            }
        );
    }
});

router.get('/used/:recipeId', function(req, res, next) {
    db.recipeCounts.update({"recipeId": req.params.recipeId}, {
        $inc: {
            recipeCount: usedRecipePoints - seenRecipePoints
        }
    });
});

router.get('/unused/:recipeId', function(req, res, next) {
    db.recipeCounts.update({"recipeId": req.params.recipeId}, {
        $inc: {
            recipeCount: seenRecipePoints - usedRecipePoints
        }
    });
});

//Reset Recipe Count
router.get('/reset/:recipeId', function(req, res, next) {
	db.recipeCounts.remove({"recipeId": req.params.recipeId});
});

//Reset All Recipe Counts
router.get('/resetAll/', function(req, res, next) {
	db.recipeCounts.remove({});
});

module.exports = router;
