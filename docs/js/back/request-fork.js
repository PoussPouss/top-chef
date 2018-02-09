
// This script is used for doing request with the Fork,
// In the aim to found discound reduct on restaurant given.

var http = require('https')
var concatStream = require('concat-stream')
var MongoClient = require('mongodb').MongoClient;

var urlDB = "mongodb://localhost:27017/";
var urlFork = "https://m.lafourchette.com/api/restaurant/"
var urlFrokDiscount = "/sale-type"



// This json is only used for testing the reasearch on the web site the Fork
var jsonTest = {
  "name": "Auberge du Cheval Blanc",
  "stars": 2,
  "street": "4 Route de Wissembourg",
  "citie": "Lembach",
  "postal": "67510"
}


/**
 * linkResarch - description
 *
 * @param  {type} json description
 * @return {type}      description
 */
function linkResarch(json) {
  var name = json.name
  name.replace(" ","_")
  name.replace("'","%27")
  var url = "https://m.lafourchette.com/api/restaurant-prediction?" +
    "name=" + name
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
    if (address.address_locality.toUpperCase() == jsonRestaurant.citie.toUpperCase() ||
      parseInt(address.postal_code) == parseInt(jsonRestaurant.postal))
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
function getURLForkRestaurant(json) {
  link = linkResarch(json)
  http.get(link, function callback(response) {
    var statusCode = response.statusCode;
    search++;
    if(statusCode == 200){
    response.pipe(concatStream(function(data) {
      var jsonObject = JSON.parse(data);
      var id = researchID(jsonObject, json)
      if(jsonObject.length != 0){
        console.log(JSON.stringify(json))
        getInformationFork(urlFork+researchID(jsonObject, json)+urlFrokDiscount)
      }

    }))}
  })
}



/**
 * getInformationFork - description
 *
 * @param  {type} link description
 * @return {type}      description
 */
function getInformationFork(link) {
  http.get(link, function callback(response) {
    response.pipe(concatStream(function(data) {
      if(data.length > 0){
        var jsonObject = JSON.parse(data);
        console.log(jsonObject);
      }
    }))
  })
}



function testFoundInfoFork(){
  /**
   * MongoClient - description
   *
   * @param  {type} urlDB        description
   * @param  {type} function(err description
   * @param  {type} db           description
   * @return {type}              description
   */
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("TOP_CHEF");
    dbo.collection("restaurants").find({}).toArray(function(err, result) {
      if (err) throw err;
      for(var i =0;i<result.length;i++){
        var jsonObject = result[i]
        console.log(jsonObject.name)
        getURLForkRestaurant(jsonObject)
      }
      db.close();
    });
  });
}
