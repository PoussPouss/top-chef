// This script is used for doing request with the Fork,
// In the aim to found discound reduct on restaurant given.

var http = require('https')
var concatStream = require('concat-stream')
var MongoClient = require('mongodb').MongoClient;
var stringSimilarity = require('string-similarity');

var urlDB = "mongodb://localhost:27017/";
var urlFork = "https://m.lafourchette.com/api/restaurant/"
var urlFrokDiscount = "/sale-type"


// This json is only used for testing the reasearch on the web site the Fork
var jsonTest = {
  "name": "La Scène Thélème",
  "stars": 1,
  "street": "18 Rue Troyon",
  "citie": "Paris",
  "postal": "75017"
}


/**
 * In a link, we need to change some characters for being validate
 * like space, "," "é" "è" ... some characters that can be create a wrong request
 *
 * @param  {type} json description
 * @return {type}      description
 */
function linkResarch(json) {
  var name = json.name
  var name = encodeURI(name).replace(/'/g, "%27").replace(/-/g,"_")
  var url = "https://m.lafourchette.com/api/restaurant-prediction?" +
    "name=" + name
  console.log(url)
  return url
}


/**
 * researchID - description
 *
 * @param  {type} jsonReceived   description
 * @param  {type} jsonRestaurant description
 * @return {type}                description
 */
function researchID(jsonReceived, jsonRestaurant) {
  for (var i = 0; i < jsonReceived.length; i++) {
    address = jsonReceived[i].address
    matchName = stringSimilarity.compareTwoStrings(jsonReceived[i].name,jsonRestaurant.name)
    console.log(matchName)
    if (parseInt(address.postal_code) == parseInt(jsonRestaurant.postal) && matchName > 0.7)
      return jsonReceived[i].id
  }
  return -1 // in the case where none restaurant match with the json
}

var search = 0;
var found = 0;

/**
 * getURLForkRestaurant - description
 *
 * @param  {type} json description
 * @return {type}      description
 */
//exports.requestfork = function getURLForkRestaurant(json) {
function getURLForkRestaurant(json) {
  return new Promise(function(resolve, reject) {
    link = linkResarch(json)
    http.get(link, function callback(response) {
      var statusCode = response.statusCode;
      search++;
      if (statusCode == 200) {
        response.pipe(concatStream(function(data) {
          var jsonObject = JSON.parse(data);
          var id = researchID(jsonObject, json)
          if (jsonObject.length != 0 && id != -1) {
            found++
            resolve(urlFork + id + urlFrokDiscount)
          } else {
            reject("not found")
          }
        }))
      }
    })
  })
}

exports.requestfork = function(json){
  return getURLForkRestaurant(json).then(function(urlRestaurant) {
    return getInformationFork(urlRestaurant)
  }).then(function(jsonRestaurant) {
    //console.log(JSON.stringify(jsonRestaurant))
    return analyzeDiscound(jsonRestaurant)
  }).then(function(reduc){
      var jsonReturn = {}
      //console.log("JSON before send : "+JSON.stringify(json))
      jsonReturn.idRestaurant = json._id
      jsonReturn.discount = reduc
      jsonReturn.date = Date.now();
      return jsonReturn
  }).catch(function(reject){
    return null
  })
}




/**
 * getInformationFork - description
 *
 * @param  {type} link description
 * @return {type}      description
 */
function getInformationFork(link) {
  return new Promise(function(resolve, reject) {
    http.get(link, function callback(response) {
      response.pipe(concatStream(function(data) {
        if (data.length > 0) {
          var jsonObject = JSON.parse(data);
          resolve(jsonObject)
        } else {
          reject("not found")
        }
      }))
    })
  })
}


function analyzeDiscound(jsonSaleType) {
  return new Promise(function(resolve,reject){
  var resultOffer = []
  for (var i = 0; i < jsonSaleType.length; i++) {
    var jsonMenu = jsonSaleType[i]
    if (jsonMenu.is_special_offer) {
      resultOffer.push(jsonMenu.discount_amount)
    }
  }
  resolve(resultOffer);
  })
}


//getURLForkRestaurant(jsonTest)
//testFoundInfoFork()

function testFoundInfoFork() {
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("TOP_CHEF");
    dbo.collection("restaurants").find({}).toArray(function(err, result) {
      if (err) throw err;
      for (var i = 0; i < result.length; i++) {
        var jsonObject = result[i]
        getURLForkRestaurant(jsonObject)
      }
      db.close();
    });
  });
}
