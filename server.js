var express = require('express');
var https = require("https");
const {URL} = require("url");
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var dbUrl = 'mongodb://Big_Willy:Fedora20@ds028310.mlab.com:28310/url_shortener';

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

app.get("/latest/imagesearch", function(request, response){
  dbConnect(getLatestSearches, response, {});
});

app.get("/imagesearch/:imageQuery", function (request, response) {
  var imageQuery = request.params.imageQuery;
  var offset = request.params.offset || 1;
  var customSearchUrl = "https://www.googleapis.com/customsearch/v1?cx="+gcsID+"&key="+gAPIKey+"&num="+10+"&start="+offset+"&searchType=image&q="+imageQuery;
  var searchResults = [];
  var urlObject = new URL(customSearchUrl);
  
  console.log(urlObject.href);
  var httpsReq = https.request(urlObject, handleSearchResponse);
  
  httpsReq.on("error", function(e){
    console.log(e);
  });
  
  httpsReq.end();
  
  function handleSearchResponse(searchResp){
    if(searchResp.statusCode === 200){
      searchResp.on("data", handleSearchData);
      searchResp.on("end", sendData);
    }
    else{
      sendError("Error in custom search request", response);
    }
  }
  
  function handleSearchData(data){
    console.log(data);
    data.items.forEach(function(searchResult){
      searchResults.push(new searchObject(searchResult));
    });
  }
  
  function sendData(){
    response.send(searchResults);
    dbConnect(addSearch, response, {query: imageQuery, when: (new Date()).toString()});
  }
  
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

function dbConnect(callback, response, data){
    MongoClient.connect(dbUrl, function(err, db){
    console.log("dbConnected");
    if(!err){
      console.log("dbConnected");
      var searchCollection = db.collection("search_histories");
      callback(db, searchCollection, response, data);
    }
    else{
      sendError(err, response);
    }
  });
}

function addSearch(db, searchCollection, response, data){
  searchCollection.insert(data, function(err, docsInserted){
    if(!err){
      console.log("Successful Insert");
    }
    db.close();
  });
}

function getLatestSearches(db, searchCollection, response, data){
  var getLastSearches = searchCollection.find().limit(10).sort({_id:-1});
  getLastSearches.then(function(err, results){
    if(!err){
      response.send(results);
    }
    else{
      sendError("Error Retrieving DB Data", response);
    }
    db.close();
  });
}

function sendError(errorText, response){
  response.send({
    Error: errorText
  });
}

function searchObject(configObject){
  this.url = configObject.link;
  this.alt = configObject.title;
  this.pageUrl = configObject.pageUrl;  
}