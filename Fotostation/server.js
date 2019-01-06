var express = require('express');
const https = require("https");
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var cookieParser = require('cookie-parser');
var fs = require('fs');

var port = 3001;

//order IS important !
//viewengine defines the file which is sent in render()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//sends all files in "scripts" automatically to the client
app.use(express.static(__dirname + '/public'));

//req.body is defined! It encodes the url (post) bodyParser installed ! and maximum set!
app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true}));

//for the cookies and so on...
app.use(cookieParser());

//routs are in a seperate file ./ for in this folder
app.use(require('./routs'));

//start server CERTIFICATE is Important
var options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  requestCert: false,
  rejectUnauthorized: false
};

var server = https.createServer(options, app).listen(port, function(){
  console.log("server started at port " + port);
}); 