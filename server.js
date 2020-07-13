'use strict';

const express = require('express');

const app = express();

require('dotenv').config();

const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 3001;

// Routes

// {
//   "search_query": "seattle",
//   "formatted_query": "Seattle, WA, USA",
//   "latitude": "47.606210",
//   "longitude": "-122.332071"
// }

app.get('/location', (request, response) => {

  let city = request.query.city;
  let geoData = require('./data/location.json')

  const obj = new Location(city, geoData)
  response.send(obj);
})

function Location(location, geoData){
  this.search_query = location;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}



// Check to confirm which PORT

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
