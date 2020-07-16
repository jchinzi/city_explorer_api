'use strict';

// Libraries

const express = require('express'); //Server Library
const cors = require('cors'); //'Bodyguard' - currently letting anyone talk to the server
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config(); //'Chamber of Secrets' - lets us access our .env

// Use the Libraries
const app = express(); //Lets us use the express libraries

app.use(cors()); //Allows ALL clients into our server

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  console.log('ERROR', err);
});

// Global Variables
const PORT = process.env.PORT || 3001; //Gets the PORT var from our env

// Routes

app.get('/location', checkTable);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);

// Not for the Front End Route
app.get('/table', showData);

//=============================Location Functions=================================

function checkTable (request, response){
  let city = request.query.city;
  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];

  client.query(sql, safeValues)
    .then(resultsFromPostgres => {
      if (resultsFromPostgres.rowCount){
        response.status(200).send(resultsFromPostgres.rows[0]);
      } else handleLocation(request, response);
    }).catch(err => console.log(err));
}

//IF city is not in the table, use the API and add new data to the table
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

      // Add data to the 'location' table
      let sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id;';
      let safeValues = [obj.search_query, obj.formatted_query, obj.latitude, obj.longitude];

      client.query(sql, safeValues)
        .then(resultsFromPostgres => {
          let id = resultsFromPostgres.rows;
          console.log('id', id)
        })

      // Catch Errors
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })
}

function Location(city, geoData){

  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//=============================Weather Function=================================

function handleWeather (request, response){

  let url = `http://api.weatherbit.io/v2.0/forecast/daily`

  let queryParameters = {
    key: process.env.WEATHER_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    days: 8
  }

  superagent.get(url)
    .query(queryParameters)
    .then(resultsFromSuperagent => {
      let forecastArray = resultsFromSuperagent.body.data.map(date => {
        return new Weather(date);
      })
      response.status(200).send(forecastArray);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}

//=============================Trails Function=================================

function handleTrails (request, response){

  let url = `https://www.hikingproject.com/data/get-trails`

  let queryParameters = {
    key: process.env.TRAIL_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    maxResults: 10
  }

  superagent.get(url)
    .query(queryParameters)
    .then(resultsFromSuperagent => {
      let trailArray = resultsFromSuperagent.body.trails.map(route => {
        return new Trail(route);
      })
      response.status(200).send(trailArray);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })
}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = obj.conditionDate.substring(0,10);
  this.condition_time = obj.conditionDate.substring(11,19);
}

//=============================Movies Function=================================

function handleMovies(request, response){

  let url = `http://api.themoviedb.org/3/search/movie`

  let queryParameters = {
    api_key: process.env.MOVIE_API_KEY,
    query: request.query.search_query,
    page: 1
  }

  superagent.get(url)
    .query(queryParameters)
    .then(resultsFromSuperagent => {
      let movieArray = resultsFromSuperagent.body.results.map(film => {
        return new Movie(film);
      })
      response.status(200).send(movieArray);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went terribly wrong');
    })
}

function Movie(obj) {
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

//=============================Yelp Function=================================



//=============================Data Visibility=================================

function showData(request, response){
  let sql = 'SELECT * FROM locations;';
  client.query(sql)
    .then(resultsFromPostgres => {
      let places = resultsFromPostgres.rows;
      response.send(places);
    }).catch(err => console.log(err));
}

//==============================Errors=================================

app.get('*', (request, response) => {
  response.status(500).send('Sorry, something went terribly wrong');
})

// ====================================================================
// Turn on Server and Confirm Port

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  }).catch(err => console.log('ERROR', err));

