'use strict';

import React, { Component } from 'react';
import Masonry from 'react-masonry-infinite';
import shortid from 'shortid';
import './App.css';
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner
} from 'react-virtualized';
import {cards} from './index.js';

var http = require('http')
var concatStream = require('concat-stream')

var linkAPI = "http://localhost:8080/restaurants-param";

var json =
[{
    "name" : "Le Cerisier",
    "street" : "3 rue de la Gare",
    "citie" : "LAVENTIE",
    "postal" : "62840",
    "url" : "https://restaurant.michelin.fr/sites/mtpb2c_fr/files/styles/poi_detail_landscape/public/ZUQUmvTNKMQBsaYA.jpg?itok=o2NOQ91b"
}]


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomHeight(){
  return 100+Math.floor(Math.random() * 100)
}


// Default sizes help Masonry decide how many images to batch-measure
const cache = new CellMeasurerCache({
  defaultHeight: 250,
  defaultWidth: 200,
  fixedWidth: true
})

// Our masonry layout will use 3 columns with a 10px gutter between
const cellPositioner = createMasonryCellPositioner({
  cellMeasurerCache: cache,
  columnCount: 4,
  columnWidth: 200,
  spacer: 10
})

const link = "https://restaurant.michelin.fr/sites/mtpb2c_fr/files/styles/poi_detail_landscape/public/iISK-1u8sxhxOIPA.jpg?itok=0p1IVlLX";


export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
      elements: []
    };
    this.getInformationFork()
  }

   getInfoAPI() {
      return new Promise(function(resolve, reject) {
        http.get(linkAPI, function callback(response) {
          console.log("Link : "+linkAPI)
          response.pipe(concatStream(function(data) {
            if (data.length > 0) {
              var jsonObject = JSON.parse(data);
              //console.log(JSON.stringify(jsonObject))
              resolve(jsonObject)
            } else {
              reject("not found")
            }
          }))
        })
      })
  }

  update() {
    this.setState({elements: []})
    this.getInformationFork()
  }

  getInformationFork(){
    this.getInfoAPI().then(response => {
            //console.log(response)
            this.setState({elements: response})
        });
  }

  colors = ['#EC407A', '#EF5350', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5', '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#827717', '#EF6C00'];
  heights = [200, 300, 300, 400, 400, 450];

  getRandomElement = array => array[Math.floor(Math.random() * array.length)];

  generateElements = () => [...Array(10).keys()].map(() => ({
    key: shortid.generate(),
    color: getRandomColor(),
    height: `${getRandomHeight()}px`,
    name : "Salut",
    background:"https://restaurant.michelin.fr/sites/mtpb2c_fr/files/styles/poi_detail_landscape/public/0hRsy7Bia6daVRlQ.jpg?itok=OSs6KkmA"
  }));

  loadMore = () => setTimeout((this.getInformationFork()), 2500);

  generateStars(){
    return `&#9734; &#9734; &#9734;`
  }

  timestampToHours(discount){
    if(discount != null){
      var formattedTime = "Last update: "
      var unix_timestamp  = discount.date
      var date = new Date(unix_timestamp);
      // Hours part from the timestamp
      var hours = date.getHours();
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();
      // Seconds part from the timestamp
      var seconds = "0" + date.getSeconds();

      // Will display time in 10:30:23 format
      formattedTime += hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      formattedTime += " "+ date.getDay()+"/"+(date.getMonth()+1);
      return formattedTime
    }
    return null
  }

  discountDisplay(discounts){
    if(discounts !=null){
      var discount = discounts.discount
      //console.log(discount)
      if(discount.length == 0){
       return "No discount"
      }
      var result = "Dicount : "
      for(var i=0;i<discount.length;i++){
        result+= discount[i]+"% "
      }
      return result
    }
    return null
  }

  handleInputChange(event) {
    console.log("Change")
    const target = event.target;
    var value = null
    const name = target.name;

    if(target.type === 'checkbox'){
      value = this.check2Stars(target.value,target.checked)
    }else{
      value = target.value
    }

    this.setState({
      [name]: value
    });
    //console.log(this.state)
    //
  }

  render() {
    if(this.state.elements == null){
      return null
    }

    return (
      <div className="App">
        <div id="title">
            <h1><b>Find the best deal</b></h1>
            <h2>Easily and fastly</h2>
            <div id="filter"/>
        </div>

        <div className="container">


          <Masonry
            className="masonry"
            cellPositioner={cellPositioner}
            hasMore={this.state.hasMore}
            loader={
              <div className="sk-folding-cube">
                <div className="sk-cube1 sk-cube" />
                <div className="sk-cube2 sk-cube" />
                <div className="sk-cube4 sk-cube" />
                <div className="sk-cube3 sk-cube" />
              </div>
            }
            loadMore={this.loadMore}
          >
            {

              this.state.elements.map(({name, url,citie,stars,discounts}, i) => (
                <div className="card" style={{background: '#FFF', height: '300px'}}>

                  <div className="information" style={{backgroundImage: 'url('+url+')'}}>
                    <p id="stars">  Number of stars: {stars} </p>
                    <h2>{name}</h2>
                    <h3>{citie}</h3>
                  </div>
                  <div className="discount">
                    <div className="header">
                      <img src={require("../src/img/silverware_fork.png")}/>
                    </div>
                    <h4>{this.timestampToHours(discounts[0])}</h4>
                    <h4>{this.discountDisplay(discounts[0])}</h4>
                  </div>
                </div>
              ))
            }
          </Masonry>
        </div>
      </div>
    );
  }
}


/*

Filter

*/

var http = require('http')
var concatStream = require('concat-stream')

export class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stars : [],
      departement: null,
      name:""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  sendRequest(){
    var url = "http://localhost:8080/restaurants-param"
    var param = ""

    if(this.state.departement !== -1 && this.state.departement !== null){
      param += "dept="+this.state.departement
    }

    if(this.state.stars.length > 0){
      if(param.length > 0){
        param += "&"
      }
      param += "stars="+this.state.stars.join('_')
    }

    if(this.state.name.length > 0){
      if(param.length > 0){
        param += "&"
      }
      param += "name="+this.state.name
    }

    if(param.length > 0){
      url += "?"+param
    }

    /*http.get(url, function callback(response) {
      response.pipe(concatStream(function(data) {
            var jsonObject = JSON.parse(data);
            console.log(JSON.stringify(jsonObject))
      }))
    })*/
    console.log("Link-filter: "+url)
    linkAPI = url
  }

  check2Stars(stars,isChecked){
    var tabStars = this.state.stars
    if(isChecked){
        tabStars.push(stars)
    }else{
      var index = tabStars.indexOf(stars);
      tabStars.splice(index, 1);
    }
    return tabStars
  }

  handleInputChange(event) {
    const target = event.target;
    var value = null
    const name = target.name;

    if(target.type === 'checkbox'){
      value = this.check2Stars(target.value,target.checked)
    }else{
      value = target.value
    }

    this.setState({
      [name]: value
    });
    //console.log(this.state)
  }

  handleSubmit(event) {
      event.preventDefault();
      this.sendRequest()
      cards.update()
  }

  render() {
    return (
      <div>
      <form onSubmit={this.handleSubmit}>
        <b>Stars </b>
        <label>

          <input
            name="stars"
            className="star"
            type="checkbox"
            value = "1"
            checked={this.state.stars1}
            onChange={this.handleInputChange} />
        </label>
        <label>

          <input
            name="stars"
            className="star"
            type="checkbox"
            value = "2"
            checked={this.state.stars2}
            onChange={this.handleInputChange} />
        </label>
        <label>

          <input
            name="stars"
            className="star"
            type="checkbox"
            value = "3"
            checked={this.state.stars3}
            onChange={this.handleInputChange} />
        </label>

        <label>
          <b> Name restaurant </b>
          <input
            name="name"
            type="text"
            value={this.state.name}
            onChange={this.handleInputChange} />
        </label>

        <label>
          <b>Departement </b>
          <input
            name="departement"
            type="number"
            value={this.state.departement}
            onChange={this.handleInputChange} />
        </label>

      <input type="submit" value="Filter" />

      </form>
      <div id='grid'></div>
      </div>
    );
  }
}


export default App;
