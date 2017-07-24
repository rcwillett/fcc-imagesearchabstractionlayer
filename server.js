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

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/latest", function(request, response){
  dbConnect(getLatestSearches, response, {});
});

app.get("/imagesearch/:imageQuery", function (request, response) {
  var imageQuery = request.params.imageQuery;
  var offset = request.params.offset || 1;
  var customSearchUrl = "https://www.googleapis.com/customsearch/v1?cx="+gcsID+"&key="+gAPIKey+"&num="+10+"&start="+offset+"&searchType=image&q="+imageQuery;
  var searchResults = [];
  var urlObject = new URL(customSearchUrl);
  var bufferResult = [];
  
  makeHttpsRequest(urlObject, sendResponse, handleImageSeachError);
  function sendResponse(searchResults){
    var returnArray = [];
    searchResults.items.forEach(function(searchResult){
      returnArray.push(new searchObject(searchResult));
    });
    response.send(returnArray);
    dbConnect(addSearch, response, {query: imageQuery, when: (new Date()).toString()});
  }
  
  function handleImageSeachError(errorText){
    response.send({
      Error: errorText
    });
  }
  
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

function makeHttpsRequest(urlObject, callback, errorCallback){
  var httpsReq = https.request(urlObject, handleHttpsResp),
      bufferResult = [];
  
  httpsReq.on("error", function(e){
    errorCallback("Error in https request");
  });
  
  httpsReq.end();
  
  function handleHttpsResp(searchResp){
    if(searchResp.statusCode === 200){
      searchResp.setEncoding("utf-8");
      searchResp.on("data", handleData);
      searchResp.on("end", handleCompletedRequest);
    }
    else{
      errorCallback("Error in custom search request");
    }
  }
  
  function handleData(data){
    bufferResult.push(data);
  }
  
  function handleCompletedRequest(){
      var jsonStringResult = bufferResult.join("");
      var jsonResult = JSON.parse(jsonStringResult);
      callback(jsonResult);
  }
}

function dbConnect(callback, response, data){
    MongoClient.connect(dbUrl, function(err, db){
    if(!err){
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
    db.close();
  });
}

function getLatestSearches(db, searchCollection, response, data){
  var getLastSearches = searchCollection.find({}, {_id: 0, query: 1, when: 1}).limit(10).sort({_id:-1});
  getLastSearches.toArray(function(err, results){
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
  this.pageUrl = configObject.image.contextLink;  
}