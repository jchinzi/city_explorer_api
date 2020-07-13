'use strict';

const express = require('express');

const app = express();

require('dotenv').config();

const cors = require('cors');

const PORT = process.env.PORT || 3001;

