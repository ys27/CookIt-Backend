var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/cookitDB', [
	'users'
]);

module.exports = db;