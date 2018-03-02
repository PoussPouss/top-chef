var http = require('https')
var concatStream = require('concat-stream')
var MongoClient = require('mongodb').MongoClient;
//var urlDB = "mongodb://localhost:27017/";
var urlDB = "mongodb://web:9wJf7p4G@ds153778.mlab.com:53778/find_the_best_deal"


var rf = require('./request-fork');


function saveJSON(json) {
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    //var dbo = db.db("TOP_CHEF");
    var dbo = db.db("find_the_best_deal");
    var myobj = json;
    dbo.collection("discounts").insert(myobj, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

function loadRestaurantAndSearch() {
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    //var dbo = db.db("TOP_CHEF");
    var dbo = db.db("find_the_best_deal");
    dbo.collection("restaurants").find().toArray(function(err, result) {
      if (err) throw err;
      var resultDB = result
      db.close();
      for (var i = 0; i < resultDB.length; i++) {
        var jsonObject = resultDB[i]
        if (jsonObject != null) {
          rf.requestfork(jsonObject).then(function(success) {
            if(success != null){
              saveJSON(success)
            }
          });
        }
      }
    });
  });
}


loadRestaurantAndSearch()
