var express = require('express');
var path = require('path');
var app = express();
var mongo = require('mongodb').MongoClient;

app.listen(process.env.PORT || 5000);
console.log("Now listening...");
app.use(express.static(path.join(__dirname, "static")));
