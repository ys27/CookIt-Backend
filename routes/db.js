var mongojs = require('mongojs');

var url = "mongodb://localhost:27017/cookitDB";
// var url = "mongodb://cookitadmin:chickenpasta@ds139781.mlab.com:39781/heroku_8vxhdkzf";
var db = mongojs(url, [
	'users',
	'recipeCounts'
]);

module.exports = db;
