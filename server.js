// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
// https://www.googleapis.com/customsearch/v1?cx=011924279700652319503:e73ssvplb2m&key=AIzaSyDfNJTWbevtP6ICuA7n9q2FachcMLaW-DI
var gcsID = "011924279700652319503:e73ssvplb2m";
var gAPIKey = "AIzaSyDfNJTWbevtP6ICuA7n9q2FachcMLaW-DI";

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/imagesearch/:imageQuery", function (request, response) {
  var imageQuery = request.params.imageQuery;
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
