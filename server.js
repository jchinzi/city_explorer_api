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

// Routes

//=============================Location=================================

app.get('/location', handleLocation);

function handleLocation (request, response){ //backend event listener on /location route

  let city = request.query.city;
  // let geoData = require('./data/location.json') //brings in JSON file
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
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })}

//   const obj = new Location(city, geoData) //make a new Object instance
//   response.status(200).send(obj); //send the location Object to the front end
// } catch(error){ //if something goes wrong in the 'try', we end up here
//   console.log('ERROR', error); //Terminal Error Message
//   response.status(500).send('Sorry, something went terribly wrong'); //On Page Error Message
// }

function Location(city, geoData){

  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//=============================Weather=================================

app.get('/weather', (request, response) => {

  let weatherData = require('./data/weather.json')
  // let forecastArray = [];

  // weatherData['data'].forEach(date => {
  //   forecastArray.push(new Weather(date));
  // })

  let forecastArray = weatherData['data'].map(date => {
    return new Weather(date);
  })

  response.status(200).send(forecastArray);
})

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
