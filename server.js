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

  try{
    let city = request.query.city;
    let geoData = require('./data/location.json')

    const obj = new Location(city, geoData)
    response.status(200).send(obj);
  } catch(error){
    console.log('ERROR', error);
    response.status(500).send('Sorry, something went terribly wrong');
  }
})

function Location(city, geoData){

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

  response.status(200).send(forecastArray);

})

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

//==============================Errors=================================

app.get('*', (request, response) => {
  response.status(500).send('Sorry, something went terribly wrong');
})

// ====================================================================
// Turn on Server and Confirm Port

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
