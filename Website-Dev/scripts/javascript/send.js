let url2 = "http://127.0.0.1:3002/receiveData";
var points = {
    points: [],
    id: null
};
//send the Coordinates

//https://stackoverflow.com/questions/247483/http-get-request-in-javascript

function httpPostAsync(theUrl, dataArray, done) {
    var number = {
        value: dataArray
    }

    var xhr = new window.XMLHttpRequest()
    xhr.open('POST', theUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(number));
    xhr.onload = function () {
        done(null, xhr.response);
    };
}

//https://stackoverflow.com/questions/247483/http-get-request-in-javascript
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



var SendTheData = function (event) {
    if (img != undefined) {
        httpPostAsync(url2, points, function (e, args) {
            args = args.replace(/\"/ig,"");
            console.log(args);
            
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
    }
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