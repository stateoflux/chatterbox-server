/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var chatMessage = {
      'username': 'batman',  // gets username from url
       'text': 'Pow',
       'roomname': 'taqueria'
     };

var _messages = [chatMessage];
var messageData = { results: _messages };


exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  // helper function to remove additional url information
  var urlSplicer = function(url) {
    var index = url.indexOf('?');
    return url.slice(0,index);
  };

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;

  var message = 'Hello, World!';
  var postMessage = '';

  // Request filter
  if (request.method === 'POST') {
    message = 'Client sent a message!';

    request.setEncoding('utf8');

    request.on('data', function(chunk) {
      console.log("received data");
      console.log(chunk);
      _messages.push(JSON.parse(chunk));
    });

  } else if (request.method === 'GET' && urlSplicer(request.url) === '/1/classes/chatterbox') {
    console.log("requesting messages");
    message = JSON.stringify(messageData);

  }

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/json";


  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  request.on('end', function() {
    /* .writeHead() tells our server what HTTP status code to send back */
    response.writeHead(statusCode, headers);

    response.end(message);
  });
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
