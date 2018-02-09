
// This script allows to create a link between the front and back

var express = require('express');
var rf = require('./request-fork');

var MongoClient = require('mongodb').MongoClient;
var urlDB = "mongodb://localhost:27017/";


var app = express();

function filter(name,stars,departament){
    var arrayFilter = []
    if(name != null){
        var researchName = new RegExp("\." + name+ "\.","i");
        var jsonName = {"name" : researchName}
        arrayFilter.push(jsonName)
    }

    if(stars != null){
        var arrayStars = []
        for(var i=0;i<stars.length;i++){
            arrayStars.push({"stars" : stars[i]})
        }
        var jsonStars = {"$or" : arrayStars}
        arrayFilter.push(jsonStars)
    }

    if(departament != -1){
      var jsonDepartement = {"postal":{"$regex": "^"+departament+"[0-9]{3}"}}
      arrayFilter.push(jsonDepartement)
    }

    // In the case where the filter isn't empty
    if(arrayFilter.length > 0){
      var result = {"$and": arrayFilter}
      console.log(JSON.stringify(result))
      return result
    }
}

//> db.restaurants.find({postal:{$regex: /^76[0-9]{3}/}})
//> db.restaurants.find({"$and": [{"stars":1},{postal:{$regex: /^76[0-9]{3}/}}]});
//db.restaurants.find({"$and": [{"$or":[{"stars":1},{"stars":2}]},{postal:{$regex: /^76[0-9]{3}/}}]});
//
// Express Methods
//

app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:3000','http://127.0.0.1:3000'];
  var origin = req.headers.origin;
   console.log("Origin : "+origin)
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);

  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.get('/restaurants/:limit/:dept/:name', function(req, res) {
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("TOP_CHEF");
    var filtre = filter(req.params.name,[1,2],parseInt(req.params.dept))
    dbo.collection("restaurants").find(filtre).limit(parseInt(req.params.limit)).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.json(result)
      db.close();
    });
  });
});

app.listen(8080);


//filter("bab",[1,2],23)
