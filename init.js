var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var users = require('./routes/users');

var app = express();

var port = 4000;

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/users', users);

app.listen(port, function(){
    console.log('Server started on port ' + port)
});