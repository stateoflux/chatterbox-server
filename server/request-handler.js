var fs = require('fs');
var _ = require('underscore')._;
var EventEmitter = require('events').EventEmitter;

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "application/json"
};

var dummyMessage = {
  'username': 'batman',  // gets username from url
  'text': 'Pow',
  'roomname': 'lobby'
};
// TODO: move message store to a file
var messageStore = 'chats.txt';
var messages = [];

var writeChatsToFile = function(filename, chats) {
  fs.writeFile(filename, JSON.stringify(chats), function(err) {
    if (err) { throw err; }
    console.log("chats file has been updated");
  });
};


// Setup event emitter and listener in order for code to read in the 
// chats from the message store file before the instantiating the chat
// server
// ============================================================================
var emitter = new EventEmitter();
var listener = new EventEmitter();

var readChatsFromFile = function(filename) {
  var storedChats = null;
  var chats = [];

  fs.readFile(filename, { encoding: 'utf-8' }, function(err, data) {
    if (err) { console.log("error!"); throw err; }
    console.log("from file: " +  data);
    debugger;
    try {
      storedChats = JSON.parse(data);
      if (Array.isArray(storedChats)) {
        chats = storedChats;
      }
      emitter.emit('chatsReady');
      return chats;
    } catch (e) {
      console.log("error thrown while parsing 'chats.txt'", e);
    }
  });
};

var roomnameFilter = function(roomToFilter) {
  return _.where(messages, {roomname: roomToFilter});
};

var sendResponse = function(response, obj, status) {
  status = status || 200;
  response.writeHead(status, headers);
  response.end(JSON.stringify(obj));
};

var returnMessages = function(request, response) {
  console.log("requesting messages");
  var paths = request.url.slice(1).split('/');
  console.log(paths);
  if (paths[0] === 'classes' && paths[1] === 'messages') {
    sendResponse(response, { results: messages });
  } else if(paths[0] === 'classes' && paths[1] !=='messages') {
    sendResponse(response, { results: roomnameFilter(paths[1]) });
  } else {
    sendResponse(response, null, 404);
  }
};

// Save received chat messages into storage
var saveMessages = function(request, response){
  var chat = "";
  request.setEncoding('utf8');
  request.on('data', function(chunk) {
    chat += chunk;
  });
  request.on('end', function() {
    messages.push(JSON.parse(chat));
    writeChatsToFile(messageStore, messages);
    sendResponse(response, "", 201);
  });
};

var respondToOptions = function(request, response) {
  sendResponse(response, null);
};

var actionList = {
  'GET': returnMessages,
  'POST': saveMessages,
  'OPTIONS': respondToOptions
};


// Initialize messages array from the messageStore ('chats.txt')
// ============================================================================
var updateMessages = function() {
  debugger;
  var chats = readChatsFromFile(messageStore);
  listener.on('chatsReady', function() {
    messages = chats;
  })
};

updateMessages();

// Request Handler
// ============================================================================
exports.handleRequest = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  actionList[request.method](request, response);
};

