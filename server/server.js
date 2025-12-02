const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
