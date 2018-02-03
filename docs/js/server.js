

/*
https://restaurant.michelin.fr/restaurants/paris/page-2
*/

// External modules
var http = require('https')
var concatStream = require('concat-stream')
var jsdom = require("jsdom")
var cheerio = require('cheerio')
var fs = require('fs')

var number_pages = 34 ;
var number_restaurants = 604;

var url = "https://restaurant.michelin.fr/restaurants/france/"
              +"restaurants-1-etoile-michelin/"
              +"restaurants-2-etoiles-michelin/"
              +"restaurants-3-etoiles-michelin"

var json_restaurant = '{'
var id_restaurant = 0;

function getURLRestaurant(link){
  http.get(link,function callback(response){
      response.pipe(concatStream(function(data) {
      var content = data.toString()

      $ = cheerio.load(content)
      var tabHref = $('.poi-card-link')

      for(var i = 0 ; i < tabHref.length;i++){
        var link = tabHref[i].attribs.href
        getInformationRestaurant("https://restaurant.michelin.fr"+link)
      }

    }))
  })
}

function getInformationRestaurant(link){
  http.get(link,function callback(response){
      response.pipe(concatStream(function(data) {
      var content = data.toString()

      $ = cheerio.load(content)

      var name = $('.poi_intro-display-title').text().split('\n')[1].trim()
      var address_street = $(($('.street-block'))[0]).text()
      var address_citie = $(($('.locality'))[0]).text()
      var address_postal = $(($('.postal-code'))[0]).text()

      var icon = ($('.guide-icon')[0]).attribs.class.split(" ")[2]
      var stars = numberStars(icon)

      json = createJsonRestaurant(name,stars,address_street,address_citie,address_postal)
      json_restaurant += json

      if(id_restaurant == number_restaurants){
            json_restaurant += "}"
            console.log(json_restaurant)
            fs.writeFileSync('./restaurants.json', json_restaurant);
      }

    }))
  }
)}

function numberStars(iconName){
  switch (iconName) {
    case "icon-cotation1etoile":
          return 1

    case "icon-cotation2etoiles":
          return 2

    case "icon-cotation2etoiles":
          return 3

    default:
           return 0
  }
}


function createJsonRestaurant(name,stars,address_street,address_citie,address_postal){

    json = '"_id":'+id_restaurant +',"info":{'+
            '"name":"'+name+'",'+
            '"stars":'+stars+','+
            '"street":"'+address_street+'",'+
            '"citie":"'+address_citie+'",'+
            '"postal":"'+address_postal+'"'+
        "},"

  id_restaurant++
  return json
}


for(var i = 1 ;i <=number_pages; i++){
  getURLRestaurant(url+"/page-"+i)
}
