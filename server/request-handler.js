var _ = require('underscore')._;

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};



var chatMessage = {
      'username': 'batman',  // gets username from url
       'text': 'Pow',
       'roomname': 'lobby'
     };

var _messages = [chatMessage];

var messageData = { results: _messages };

var statusCode = 200; // default status code

var saveMessages = function(request){
  statusCode = 201;
  request.setEncoding('utf8');

  collectData(request);
};

var collectData = function(request) {
  request.on('data', function(chunk) {
    _messages.push(JSON.parse(chunk));
  });
};


// if responseBody is not defined below, this is the default body
var responseBody;

exports.handleRequest = function(request, response) {

  // helper function to remove additional url information
  var urlSplicer = function(url) {
    var index = url.indexOf('?');
    return url.slice(0,index);
  };

  var roomnameFilter = function(roomToFilter) {
    return _.where(_messages, {roomname: roomToFilter});
  };


  console.log("Serving request type " + request.method + " for url " + request.url);

  // Request filter
  if (request.method === 'POST') {
    saveMessages(request);
  } else if (request.method === 'GET') {
    console.log("requesting messages");
    statusCode = 200;
    paths = request.url.slice(1).split('/');
    console.log(paths);
    if (paths[0] === 'classes' && paths[1] === 'messages') {
      responseBody = _messages;
    } else if(paths[0] === 'classes' && paths[1] !=='messages') {
      responseBody = roomnameFilter(paths[1]);  // function to filter messages
    } else {
      statusCode = 404;
    }

  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
  }

  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/json";

  // once request finishes sending, we can send response via this callback function
  request.on('end', function() {
    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);

    response.end(JSON.stringify({results: responseBody}));
  });
};