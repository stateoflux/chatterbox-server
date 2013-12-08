var _ = require('underscore')._;

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};

var dummyMessage = {
  'username': 'batman',  // gets username from url
  'text': 'Pow', 
  'roomname': 'lobby'
};

var statusCode = 200; // default status code
var _messages = [dummyMessage];
var responseBody;

var roomnameFilter = function(roomToFilter) {
  return _.where(_messages, {roomname: roomToFilter});
};

var returnMessages = function(request) {
  console.log("requesting messages");
  var paths = request.url.slice(1).split('/');
  console.log(paths);
  if (paths[0] === 'classes' && paths[1] === 'messages') {
    console.log(responseBody);
    responseBody = { results: _messages };
  } else if(paths[0] === 'classes' && paths[1] !=='messages') {
    responseBody = { results: roomnameFilter(paths[1]) };  // function to filter messages
  } else {
    statusCode = 404;
  }
};

// Save received chat messages into storage
var saveMessages = function(request){
  statusCode = 201;
  request.setEncoding('utf8');
  request.on('data', function(chunk) {
    _messages.push(JSON.parse(chunk));
  });
};

var respondToOptions = function(request, response) {
  debugger;
  responseBody = '';
  request.on('end', function() {
    console.log("about to send response");
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(responseBody));
  });
};

var actionList = {
  'GET': returnMessages,
  'POST': saveMessages,
  'OPTIONS': respondToOptions
};

// Request Handler
// ============================================================================
exports.handleRequest = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  actionList[request.method](request, response);
  // debugger;
  // request.on('end', function() {
  //   console.log("about to send response");
  //   response.writeHead(statusCode, headers);
  //   response.end(JSON.stringify(responseBody));
  // });
};