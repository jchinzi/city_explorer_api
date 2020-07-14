'use strict';

// Libraries

const express = require('express'); //Server Library
const cors = require('cors'); //'Bodyguard' - currently letting anyone talk to the server
const superagent = require('superagent');
require('dotenv').config(); //'Chamber of Secrets' - lets us access our .env

// Use the Libraries
const app = express(); //Lets us use the express libraries
app.use(cors()); //Allows ALL clients into our server

// Global Variables
const PORT = process.env.PORT || 3001; //Gets the PORT var from our env
const locationResponse = [];

// Routes

//=============================Location=================================

app.get('/location', handleLocation);

function handleLocation (request, response){ 

  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php`;

  let queryParameters = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }

  superagent.get(url)
    .query(queryParameters)
    .then(resultsFromSuperagent => {
      let geoData = resultsFromSuperagent.body;
      const obj = new Location(city, geoData);
      response.status(200).send(obj);
      locationResponse.push(obj);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })}

function Location(city, geoData){

  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//=============================Weather=================================

app.get('/weather', handleWeather);

function handleWeather (request, response){

  console.log('Location Array:', locationResponse);

  let url = `http://api.weatherbit.io/v2.0/forecast/daily`

  let queryParameters = {
    key: process.env.WEATHER_API_KEY,
    lat: this.latitude,
    lon: this.longitude
  }

  superagent.get(url)
    .query(queryParameters)
    .then(resultsFromSuperagent => {
      let forecastArray = resultsFromSuperagent.body.data.map(date => {
        return new Weather(date);
      })
      response.status(200).send(forecastArray);
    })

  // let forecastArray = weatherData['data'].map(date => {
  //   return new Weather(date);
  // })

}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString(); //may need to switch to valid_date if API doesn't cooperate
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
