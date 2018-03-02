
// This script is used for searching information about restaurant
// And saves data in a database

// External modules
var http = require('https')
var concatStream = require('concat-stream')
var jsdom = require("jsdom")
var cheerio = require('cheerio')
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;

var urlDB = "mongodb://localhost:27017/";

var number_pages_begin = 25;
var number_pages_end = 35;//35 ;
var number_restaurants = countNumberResaurant(number_pages_end) - countNumberResaurant(number_pages_begin);//number_pages*18;

var url = "https://restaurant.michelin.fr/restaurants/france/"
              +"restaurants-1-etoile-michelin/"
              +"restaurants-2-etoiles-michelin/"
              +"restaurants-3-etoiles-michelin"

var json_restaurant = []//'{"restaurants":['
var id_restaurant = 0;

/**
 * From a url page restaurant, call for each restaurant the methods that allonwing
 * to scrap information
 * @param {string} link - restaurant research page
 */

function countNumberResaurant(page){
  if(page == 35){
    return 615;
  }
  return page * 18;
}


var tabLink = []
function getURLRestaurant(link){
  http.get(link,function callback(response){
      response.pipe(concatStream(function(data) {
      var content = data.toString()

      $ = cheerio.load(content)
      var tabHref = $('.poi-card-link')

      for(var i = 0 ; i < tabHref.length;i++){
        var link = tabHref[i].attribs.href
        tabLink.push(link)
        //getInformationRestaurant("https://restaurant.michelin.fr"+link)
      }

      if(tabLink.length == number_restaurants){
        for(var i=0;i<tabLink.length;i++){
          getInformationRestaurant("https://restaurant.michelin.fr"+tabLink[i])
        }
      }

    }))
  })
}


/**
 * getInformationRestaurant - description
 *
 * @param  {type} link description
 * @return {type}      description
 */
function getInformationRestaurant(link){
  http.get(link,function callback(response){
      response.pipe(concatStream(function(data) {
      var content = data.toString()
      $ = cheerio.load(content)

      console.log("URL restaurant : "+link)

      var name = $('.poi_intro-display-title').text().split('\n')[1].trim()
      var address_street = $(($('.street-block'))[0]).text()
      var address_citie = $(($('.locality'))[0]).text()
      var address_postal = $(($('.postal-code'))[0]).text()
      var url = ($($('.auto_image_style.landscape')))[0]
      if(url != null){
        url = url.attribs["data-src"]
      }
      console.log(url)

      var icon = ($('.guide-icon')[0]).attribs.class.split(" ")[2]
      var stars = numberStars(icon)

      json = createJsonRestaurant(name,stars,address_street,address_citie,address_postal,url)
      saveJSON(json)
    //  json_restaurant.push(json)

    /*  if(id_restaurant == number_restaurants){
          saveJSON(json)
          //console.log("END")
      }*/

    }))
  }
)}



/**
 * numberStars - from the icon stars return the starts in int
 *
 * @param  {type} iconName the icon name caught in the html restaurant
 * @return {type}          number starts
 */
function numberStars(iconName){
  switch (iconName) {
    case "icon-cotation1etoile":
          return 1

    case "icon-cotation2etoiles":
          return 2

    case "icon-cotation3etoiles":
          return 3

    default:
           return 0
  }
}



/**
 * createJsonRestaurant - From information passed in the paramters of this function
 * return a json with this information
 *
 * @param  {type} name           name of the restaurant
 * @param  {type} stars          number of starts get the restaurant
 * @param  {type} address_street the street address
 * @param  {type} address_citie  the citie address
 * @param  {type} address_postal the postal address
 * @return {type}                description
 */
function createJsonRestaurant(name,stars,address_street,address_citie,address_postal,url){

    json ={
            "name": name,
            "stars": stars,
            "street":address_street,
            "citie":address_citie,
            "postal":address_postal,
            "url":url
          }
  console.log("Restaurant id : "+id_restaurant+" added")
  id_restaurant++
  return json
}


/**
 * saveJSON - from json variable saves the
 *
 * @param  {type} json description
 * @return {type}      description
 */
function saveJSON(json){
  //json_restaurant += "]}"
  //fs.writeFileSync('./restaurants.json', json_restaurant);
  MongoClient.connect(urlDB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("TOP_CHEF");
    dbo.collection("restaurants").insert(json, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });
}


/**
 * scrappingData - description
 *
 * @return {type}  description
 */
function scrappingData(){
  for(var i = number_pages_begin ;i <=number_pages_end; i++){
   getURLRestaurant(url+"/page-"+i)
   //setTimeout(function(){getURLRestaurant(url+"/page-"+i)},1500*i);
  }
}


//getInformationRestaurant("https://restaurant.michelin.fr/2af46v7/le-pre-catelan-paris-16")

scrappingData()
