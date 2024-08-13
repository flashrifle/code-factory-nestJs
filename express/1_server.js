const http = require('http');
const url = require('url');

const host = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    const path = url.parse(req.url).pathname;

    if(path === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Home Page</h1>');
    } else if (path === '/post') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Post Page</h1>');
    } else if (path === '/user') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>User Page</h1>');
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<h1>404 Page</h1>');
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Hello world</h1>')
});

server.listen(port, host, () => {
    console.log(`Express server listening on port http://localhost:${port}`);
});