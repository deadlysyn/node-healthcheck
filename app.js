const express = require('express');

const app = express();
const ip = process.env.IP || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// hold test results
global.testResults = { status: 200 };

// simulate tests taking >1s
// change message to non-OK string to simulate failure
const databaseTest = () =>
  new Promise(resolve => {
    setTimeout(() => {
      console.log('db test running');
      resolve({
        message: 'OK',
        timestamp: Date.now(),
      });
    }, 3000);
  });

const networkTest = () =>
  new Promise(resolve => {
    setTimeout(() => {
      console.log('network test running');
      resolve({
        message: 'OK',
        timestamp: Date.now(),
      });
    }, 2000);
  });

const testRunner = async (req, next) => {
  testResults.database = await databaseTest();
  if (testResults.database.message !== 'OK') {
    testResults.status = 500;
  }
  testResults.network = await networkTest();
  if (testResults.network.message !== 'OK') {
    testResults.status = 500;
  }
  // etc...
};

// routes
app.get('/', (req, res, next) => {
  res.json({ message: 'Hello World!' });
});

app.get('/healthcheck', (req, res, next) => {
  // not middleware so we don't wait for next()
  testRunner();
  res.status(testResults.status).json(testResults);
});

app.all('*', (req, res, next) => {
  res.status(404).json({ message: 'Page not found.' });
});

app.listen(port, ip, () => {
  console.log(`listening on ${ip}:${port}`);
});
