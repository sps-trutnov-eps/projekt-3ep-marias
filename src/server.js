const http = require('http');

const app = require('./app');

const port = require('./conf').port;

http.createServer(app).listen(port, () => {
    console.log('Pánové, server jede na portu: ' + String(port));
});