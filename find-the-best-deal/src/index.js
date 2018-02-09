import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var http = require('http')
var concatStream = require('concat-stream')

class Reservation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stars : [],
      departement: -1,
      name:""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  sendRequest(name,departement){
    var link = "http://localhost:8080/restaurants/10/"+departement+"/"+name
    http.get(link, function callback(response) {
      response.pipe(concatStream(function(data) {
            var jsonObject = JSON.parse(data);
            console.log(JSON.stringify(jsonObject))
      }))
    })
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
    console.log(this.state)
  }

  handleSubmit(event) {
      event.preventDefault();
      console.log('Stars ' + this.state.stars);
      this.sendRequest(this.state.name,this.state.departement)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>filter</h2>
        <b>Stars</b> <br />
        <label>
          1:
          <input
            name="stars"
            type="checkbox"
            value = "1"
            checked={this.state.stars1}
            onChange={this.handleInputChange} />
        </label>
        <label>
          2:
          <input
            name="stars"
            type="checkbox"
            value = "2"
            checked={this.state.stars2}
            onChange={this.handleInputChange} />
        </label>
        <label>
          3:
          <input
            name="stars"
            type="checkbox"
            value = "3"
            checked={this.state.stars3}
            onChange={this.handleInputChange} />
        </label>
         <br />
        <label>
          <b>Name restaurant</b> <br />
          <input
            name="name"
            type="text"
            value={this.state.name}
            onChange={this.handleInputChange} />
        </label>
        <br />
        <label>
          <b>Departement</b> <br />
          <input
            name="departement"
            type="number"
            value={this.state.departement}
            onChange={this.handleInputChange} />
        </label>
      <br />
      <input type="submit" value="Submit" />

      </form>
    );
  }
}


ReactDOM.render(
  <Reservation />,
  document.getElementById('root')
);
