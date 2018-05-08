const path = require('path');
const https = require('https');
const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const port = process.env.PORT || 5000;
const key = process.env.API_KEY;
const searchID = process.env.SEARCH_ID;

app.listen(port);
console.log(`Now listening on port ${port}`);
app.use(express.static(path.join(__dirname, "static")));

app.get('/imagesearch/:search', function(req, res){
  if(req.query.offset > 90){
    res.send({
      response: "invalid"
    });
  }
  else {
    var start = Number(req.query.offset) + 1;
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
        for(var each in query.items){
          final.push({
            result: query.items[each].title,
            image: query.items[each].link,
            page: query.items[each].image.contextLink
          });
        }
        res.send(final);
      });
    });
  }
});
