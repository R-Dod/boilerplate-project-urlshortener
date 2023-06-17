require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const urls = require('./routes').urls
const dns = require('node:dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/shorturl', function middleware(req, res, next) {
  const url = new URL(req.body.url)
  console.log(url.hostname, url.pathname);
  dns.lookup(url.host, (err, address, family) => {
    if (err) {
      console.error(err);
      req.origUrl = null;
    } else {
      req.origUrl = req.body.url;
    }
  });
  next();
},
  function (req, res) {
    console.log("origURL: ", req.origUrl);
    let response;
    if (req.origUrl === undefined) {
      response = { error: "invalid url" };
    }
    else {
      urls.push(req.origUrl);
      const index = urls.length - 1;
      response = { original_url: urls[index], short_url: index }
    }
    res.json(response);
  });

app.get('/api/shorturl/:id', function (req, res) {
  res.redirect(urls[req.params.id]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
