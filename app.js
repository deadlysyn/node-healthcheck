const express = require('express');
const m = require('./middleware');

const ip = process.env.IP || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();

// const fs = require('fs');
// const path = require('path');
// const configFile = path.join(__dirname, process.env.CONF);

app.use((req, res, next) => {
  express.static('public');

  if (!req.app.locals.testResults) {
    req.app.locals.testResults = {};
  }

  if (!req.app.locals.statusCode) {
    req.app.locals.statusCode = 200;
  }

  next();
});

// routes
app.get('/', (req, res, next) => {
  res.json({ message: 'Hello World!' });
});

app.get('/healthcheck', m.healthcheck, (req, res, next) => {
  // timestamp: new Date().toJSON(),
  res.status(req.app.locals.statusCode).json({ results: req.app.locals.testResults });
});

app.all('*', (req, res, next) => {
  res.status(404).json({ message: 'Page not found.' });
});

app.listen(port, ip, _ => {
  console.log(`listening on ${ip}:${port}`);
});
