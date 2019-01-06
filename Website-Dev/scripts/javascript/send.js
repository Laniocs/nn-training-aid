let url2 = "/receiveData";
var points = {
    points: [],
    id: null
};
//send the Coordinates


function httpPostAsync(theUrl, dataArray, done) {
    var number = {
        value: dataArray
    }

    var xhr = new window.XMLHttpRequest();
    xhr.open('POST', theUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(number));
    xhr.onload = function () {
        done(null, xhr.response);
    };
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function xhrSuccess() {
    this.callback.apply(this, this.arguments);
}

function xhrError() {
    console.error(this.statusText);
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function mulBox(obj, m) {
    let res = clone(obj);
    res.confidence = Math.floor(res.confidence * 100);
    res.f = {
        x: Math.round(obj.f.x * m),
        y: Math.round(obj.f.y * m)
    };
    res.s = {
        x: Math.round(obj.s.x * m),
        y: Math.round(obj.s.y * m)
    };
    return res;
}

var SendTheData = function (event) {
    if(denySend)return true;
    let sending = [];
    if (img != undefined) {
        
        for (i of points.points) {
            sending.push(mulBox(i, ratio));
        }
    }
    points.points = sending;

    httpPostAsync(url2, points, function (e, args) {
        args = args.replace(/\"/ig, "");

        if (args == "done" || args == "deleted") {
            //reset
            points = {
                points: [],
                id: null
            }
            img = undefined;
            temp = undefined;
            moving = undefined;
            drawImg();
        } else {
            alert("Error");
        }
    });

event.preventDefault();
};

//form
var form = document.getElementById("send");

// attach event listener
form.addEventListener("submit", SendTheData, true);

document.addEventListener("keydown", keyDown, false);

function keyDown(e) {
    if (e.keyCode == 32) {
        SendTheData(e);
    }
}



function makeRequest(method, url, done) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
        done(null, xhr.response);
    };
    xhr.onerror = function () {
        done(xhr.response);
    };
    xhr.send();
}
