var http = require("http");
var url = require("url");
var fs = require("fs");
var requestHandler = require("./request-handler");
var port = 8081;
var ip = "127.0.0.1";

var rootHandler = requestHandler.rootHandler;
var messageHandler = requestHandler.handleRequest;


var router = {
  "/": rootHandler,
  "/classes/messages": messageHandler
};
var server = http.createServer(function(request, response) {
  var path = url.parse(request.url).pathname;
  var handler = router[path];

  if (handler) {
    handler(request, response);
  }
  else {

  }
});

console.log("Listening on http://" + ip + ":" + port);

server.listen(port, ip);