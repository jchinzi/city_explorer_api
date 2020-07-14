'use strict';

const express = require('express');

const app = express();

require('dotenv').config();

const cors = require('cors');
const { request, response } = require('express');

app.use(cors());

const PORT = process.env.PORT || 3001;

// Routes

//=============================Location=================================

app.get('/location', (request, response) => {

  let city = request.query.city;
  let geoData = require('./data/location.json')

  const obj = new Location(city, geoData)
  console.log('OBJ:', obj);
  response.send(obj);
})

function Location(city, geoData){

  console.log('City', city);

  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//=============================Weather=================================

app.get('/weather', (request, response) => {

  let weatherData = require('./data/weather.json')
  let forecastArray = [];

  weatherData['data'].forEach(date => {
    forecastArray.push(new Weather(date));
  })

  response.send(forecastArray);

})

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
} 

// ====================================================================
// Turn on Server and Confirm Port

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
