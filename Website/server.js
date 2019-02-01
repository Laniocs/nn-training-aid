const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');

//get interfaces of network
const os = require('os');
const ifaces = os.networkInterfaces();

const port = 3001;


let localIp;

Object.keys(ifaces).forEach(function (ifname) {
  let alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log("hol up");
    } else {
      // this interface has only one ipv4 adress
      localIp = iface.address;
    }
    ++alias;
  });
});


//order IS important !
//viewengine defines the file which is sent in render()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//sends all files in "scripts" automatically to the client
app.use(express.static(__dirname + '/public'));

//req.body is defined! It encodes the url (post) bodyParser installed !
app.use(express.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//for the cookies and so on...
app.use(cookieParser())


//routs are in a seperate file ./ for in this folder
app.use(require('./routs'));

//start server
app.listen(port, function () {
  console.log("[server]: I'm ready on: http://" + localIp + ":" + port);
});