const express = require('express');
const m = require('./middleware');

const ip = process.env.IP || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();

app.use((req, res, next) => {
  if (!req.app.locals.testResults) {
    req.app.locals.testResults = {};
  }

  if (!req.app.locals.statusCode) {
    req.app.locals.statusCode = 200;
  }

  next();
});

// simulate tests which take >1s
const databaseTest = (req, res, next) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(() => {
        req.app.locals.testResults.database = {
          message: 'OK',
          timestamp: Date.now().toJSON(),
        };
        req.app.locals.statusCode = 200;
      });
    }, 2000);
  });

const networkTest = (req, res, next) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(() => {
        req.app.locals.testResults.network = {
          message: 'OK',
          timestamp: Date.now().toJSON(),
        };
        req.app.locals.statusCode = 200;
      });
    }, 3000);
  });

const runTests = async (req, res, next) => {
  const db = await databaseTest(req);
  const net = await networkTest(req);
  next();
};

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

app.listen(port, ip, () => {
  console.log(`listening on ${ip}:${port}`);
});
