// This script allows to create a link between the front and back

var express = require('express');
var rf = require('./request-fork');

var MongoClient = require('mongodb').MongoClient;

//var urlDB = "mongodb://localhost:27017/";
var urlDB = "mongodb://web:9wJf7p4G@ds153778.mlab.com:53778/find_the_best_deal"

var app = express();

function filter(name, stars, departament) {
  var arrayFilter = []
  if (name != null) {
    var researchName = new RegExp("\." + name + "\.", "i");
    var jsonName = {
      "name": researchName
    }
    arrayFilter.push(jsonName)
  }

  if (stars != null) {
    var arrayStars = []
    for (var i = 0; i < stars.length; i++) {
      arrayStars.push({
        "stars": stars[i]
      })
    }
    var jsonStars = {
      "$or": arrayStars
    }
    arrayFilter.push(jsonStars)
  }

  if (departament != -1) {
    var jsonDepartement = {
      "postal": {
        "$regex": "^" + departament + "[0-9]{3}"
      }
    }
    arrayFilter.push(jsonDepartement)
  }

// Mettre un filtre pour les discount vides
     //arrayFilter.push({"discounts.discount" :  { $exists: true, $not: {$size: 0} }})

  // In the case where the filter isn't empty
  if (arrayFilter.length > 0) {
    var result = {
      "$and": arrayFilter
    }
    console.log("FILTER : " + JSON.stringify(result))
    return result
  }
}




//
// Express Methods
//

/**
 * For doing some test on the same network, we must to accept
 * a local connection on our api
 */
app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  var origin = req.headers.origin;
  console.log("Origin : " + origin)
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

/**
 * In terms of parameters indicate in the route of the url
 *
 * @param  {type} '/restaurants/:limit/:dept' description
 */
app.get('/restaurants/:limit/:dept', function(req, res) {
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    //var dbo = db.db("TOP_CHEF");
    var dbo = db.db("find_the_best_deal");
    var filtre = filter(null, [1, 2], parseInt(req.params.dept))
    dbo.collection("restaurants").find(filtre).limit(parseInt(req.params.limit)).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      res.json(result)
      db.close();
    });
  });
});

/**
 * This link takes param like php parameters, with this kind of way
 * paramters can be optional
 *
 * @param  {type} '/restaurants-param' route origin
 */
app.get('/restaurants-param', function(req, res) {
  var jsonSend = Object
  var limit = req.param("limit") != null ? parseInt(req.param("limit")) : -1
  var dept = req.param("dept") != null ? parseInt(req.param("dept")) : -1
  var stars = req.param("stars") != null ? req.param("stars").split('_').map(Number) : null;
  var name = req.param("name")
  var filtre = filter(name, stars, dept)
  showRestaurantFromDatabase(filtre, limit).then(function(result) {
      res.json(result)
  })
});


app.get('/restaurants-promises', function(req, res) {
  //var jsonSend = Object
  var limit = req.param("limit") != null ? parseInt(req.param("limit")) : null
  var dept = req.param("dept") != null ? parseInt(req.param("dept")) : -1
  var stars = req.param("stars") != null ? req.param("stars").split('_').map(Number) : null;
  var name = req.param("name")
  //console.log("Stars :" + stars)
  var filtre = filter(name, stars, dept)
  researchDatabase(filtre, limit).then(function(result) {
    createJSONResponse(result, res);
  })
});





function researchDatabase(filtre, limite) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(urlDB, function(err, db) {
      if (err) throw err;
      console.log("Limite : " + limite)
      //var dbo = db.db("TOP_CHEF");
      var dbo = db.db("find_the_best_deal")
      dbo.collection("restaurants").find(filtre).limit(parseInt(limite)).toArray(function(err, result) {
        if (err) throw (err);
        db.close();
        resolve(result)
      });
    });
  })
}

function createJSONResponse(jsonResult, res) {
  var json = []; // Way to declare an empty JSON object
  var promises = []
  for (var i = 0; i < jsonResult.length; i++) {
    var jsonRestaurant = jsonResult[i]
    //console.log("restaurant:"+JSON.stringify(jsonRestaurant))
    promises.push(rf.requestfork(jsonRestaurant))
  }
  Promise.all(promises).then(function(data) {
    var jsonSend = data
    res.send(jsonSend)
  })
}

function researchDiscountPrice(jsonResult) {
  for (var i = 0; i < jsonResult.length; i++) {
    var jsonRestaurant = jsonResult[i]
    console.log(jsonRestaurant.name)
    rf.requestfork(jsonRestaurant)
  }
}



function showRestaurantFromDatabase(filter, limit) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(urlDB, function(err, db) {
      if (err) throw err;
      //var dbo = db.db("TOP_CHEF");
      var dbo = db.db("find_the_best_deal");
      var aggregateProperties = []
      aggregateProperties.push({
        $lookup: {
          from: 'discount',
          localField: '_id',
          foreignField: 'idRestaurant',
          as: 'discounts'
        }
      })
      if (filter != null) {
        aggregateProperties.push({
          $match: filter
        })
      }
      if (limit != -1) {
        aggregateProperties.push({
          $limit: limit
        })
      }

      console.log(JSON.stringify(aggregateProperties))
      dbo.collection('restaurants').aggregate(aggregateProperties).toArray(function(err, res) {
        if (err) throw err;
        resolve(res)
        db.close();
      });
    });
  });
}





/*function getRestaurant(filtre, limit, url) {
  return researchDatabase(filtre, limit, url).then(function())
}*/


// Allows to listen communication on this port
app.listen(8080);
