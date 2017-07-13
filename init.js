var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var recipeAPIName = "edamam";

var index = require('./routes/index');
var users = require('./routes/users');
var recipes = require('./routes/'+recipeAPIName);
var recipeCounts = require('./routes/recipeCounts');

var app = express();

var port = process.env.PORT || 4000;

//View Engine
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', index);
app.use('/users', users);
app.use('/recipes', recipes);
app.use('/recipeCounts', recipeCounts);

app.listen(port, function(){
    console.log('Server started on port '+ port)
});
