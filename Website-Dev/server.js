const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const port = 3002;

//order IS important !
//viewengine defines the file which is sent in render()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//sends all files in "scripts" automatically to the client
app.use(express.static(__dirname + '/scripts'));

//cors
app.use(cors());
//req.body is defined! It encodes the url (post) bodyParser installed !
app.use(express.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//for the cookies and so on...
app.use(cookieParser());


//routs are in a seperate file ./ for in this folder
app.use(require('./routs'));

//start server
app.listen(port, function() {
  console.log("[server]: ready on port " + port);
});