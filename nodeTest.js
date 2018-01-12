var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
const websocket = require("./ws");

const MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join("assets", pathname);
    //console.log(realPath);
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
}).listen(9900);
websocket.upgrad(server, (ws) => {
    ws.on('close', (reason) => {
      console.log("socket closed:" + reason);
    });
  
    ws.on('message', (data) => {
      websocket.brocast(data);
    });
});

// srv.on('upgrade', (req, socket, head) => {

// 	let key = req.headers['sec-websocket-key'];
// 	key = crypto.createHash('sha1')
//         .update(key + MAGIC_STRING)
//        	.digest('base64');

// 	const headers = [
// 		'HTTP/1.1 101 Switching Protocols',
// 		'Upgrade: websocket',
// 		'Connection: Upgrade',
// 		'Sec-WebSocket-Accept: ' + key
// 	];

//   	socket.write(headers.join("\r\n") + "\r\n\r\n", 'ascii');

//   	const ws = new WebSocket(socket);
//   	WebSocketCollector.push(ws);
//   	callback(ws);
//   	socket.pipe(socket); // echo back
// });
