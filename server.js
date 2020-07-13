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

// app.get('/location', (request, response) => {
//   console.log(request.query);
//   let city = request.query.city;
// })

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
