const cfenv = require('cfenv');
const path = require('path');

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: path.join(__dirname, '../test/vcap.json'),
});

/* helpers */

// common tasks run on any errors
function handleErr(err, cfg, callback) {
  console.log(err);
  cfg.res.status(500);
  cfg.results.message = err.toString();
  cfg.req.app.locals.testResults[cfg.svc] = cfg.results;
  return callback();
}

// build config object for test
function init(req, res, svc) {
  return {
    creds: appEnv.getServiceCreds(svc),
    req,
    res,
    svc,
    time: Date.now(),
    results: {
      message: 'success',
      seconds_elapsed: -255,
    },
  };
}

// generate random names for test tables, queues, etc.
function randName() {
  let name = 'splinter'; // prefix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 8; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return name;
}

/* middleware */

const middleware = {};

middleware.testMysql = (req, res, next) => {
  const svc = req.app.locals.conf.mysqlInstance;
  const cfg = init(req, res, svc);
  const tbl = randName();

  const mysql = require('mysql');
  const db = mysql.createConnection(cfg.creds.uri);

  const cleanup = _ => {
    db.query('DROP TABLE ??', tbl, _ => {
      db.destroy();
      return next();
    });
  };

  db.connect(err => {
    if (err) {
      handleErr(err, cfg, cleanup);
    } else {
      db.query('CREATE TABLE ?? (timestamp BIGINT)', tbl, err => {
        if (err) {
          handleErr(err, cfg, cleanup);
        } else {
          db.query('INSERT INTO ?? (timestamp) VALUES(?)', [tbl, cfg.time], err => {
            if (err) {
              handleErr(err, cfg, cleanup);
            } else {
              db.query('SELECT timestamp FROM ?? LIMIT 1', tbl, (err, result) => {
                if (err) {
                  handleErr(err, cfg, cleanup);
                } else if (result) {
                  cfg.results.seconds_elapsed = (Date.now() - result[0].timestamp) / 1000;
                  req.app.locals.testResults[svc] = cfg.results;
                  cleanup();
                } else {
                  handleErr('Error: No results from query', cfg, cleanup);
                }
              });
            }
          });
        }
      });
    }
  });
};

middleware.testRedis = (req, res, next) => {
  const svc = req.app.locals.conf.redisInstance;
  const cfg = init(req, res, svc);
  const q = randName();

  const redis = require('redis');
  const client = redis.createClient({
    host: cfg.creds.hostname,
    port: cfg.creds.port,
    password: cfg.creds.password,
  });

  const cleanup = _ => {
    client.quit();
    return next();
  };

  client.on('error', err => handleErr(err, cfg, cleanup));
  client.set(q, cfg.time, 'EX', 30); // expire after 30 seconds
  client.get(q, (err, timestamp) => {
    if (err) {
      handleErr(err, cfg, cleanup);
    } else {
      cfg.results.seconds_elapsed = (Date.now() - timestamp) / 1000;
      req.app.locals.testResults[svc] = cfg.results;
      cleanup();
    }
  });
};

module.exports = middleware;
