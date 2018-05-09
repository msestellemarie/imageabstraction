const path = require('path');
const https = require('https');
const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/image';
const database = url.split(/(mongodb:\/\/[\w\W]*\/)/).filter(Boolean)[1] || 'image';
const port = process.env.PORT || 5000;
const key = process.env.API_KEY;
const searchID = process.env.SEARCH_ID;
console.log(searchID);

app.listen(port);
console.log(`Now listening on port ${port}`);

app.get('/latest', function(req, res){
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db(database).collection('latest').find({},{limit: 10, sort: {$natural:-1}, projection: {_id: 0}}).toArray(function(err, data){
      if(err){throw err;}
      res.send(data);
    });
  });
});

app.get('/imagesearch/:search', function(req, res){
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db(database).collection('latest').insert({
      search: req.params.search,
      timestamp: new Date()
    });
  });
  var start = Number(req.query.offset) + 1 || 1;
  var search = req.params.search;
  https.get(`https://www.googleapis.com/customsearch/v1?q=${search}&cx=${searchID}&num=10&searchType=image&start=${start}&key=${key}`,function(results){
    var final = [];
    var str = "";
    results.setEncoding("utf8");
    results.on('data', function(data){
      str += data;
    });
    results.on('end', function(data){
      var query = JSON.parse(str);
      console.log(query);
      if(query.error){
        res.send([]);
      }
      else {
        for(var each in query.items){
          final.push({
            result: query.items[each].title,
            image: query.items[each].link,
            page: query.items[each].image.contextLink
          });
        }
        res.send(final);
      }
    });
  });
});
