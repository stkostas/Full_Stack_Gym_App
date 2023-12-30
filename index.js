
fetch('/')
    .then(response => response.text())
    .then(data => {
        document.getElementById('data-container').innerHTML = data;
    })
    .catch(error => console.error(error));








// FOR LOCAL SERVER HOSTING
// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello World\n');
// }).listen(8080);
// console.log('Server running on port 8080.');