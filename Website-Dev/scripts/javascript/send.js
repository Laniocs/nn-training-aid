const url2 = "/receiveData";
let points = {
    points: [],
    id: null
};
//send the Coordinates

function makeRequest(method = "GET", url, dataArray = undefined) {
    return new Promise((res, rej) => {
        const data = {
            value: dataArray
        }

        const xhr = new window.XMLHttpRequest();
        xhr.open(method, url, true);
        
        if (dataArray != undefined) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(data))
        } else {
            xhr.send();
        }
        xhr.onload = function () {
            res(JSON.parse(xhr.response));
        };
        xhr.onerror = (e) => {
            res("fml")
        }
    });
}

function mulBox(obj, m) {
    let res = {...obj};
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

async function SendTheData(event) {
    if (denySend) return true;
    let sending = [];
    if (img != undefined) {
        for (i of points.points) {
            sending.push(mulBox(i, ratio));
        }
    }else return;
    points.points = sending;

    let args = await makeRequest("POST", url2, points);

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

    event.preventDefault();
};

//form
const form = document.getElementById("send");

// attach event listener
form.addEventListener("submit", SendTheData, true);

document.addEventListener("keydown", keyDown, false);

function keyDown(e) {
    if (e.keyCode == 32) {
        SendTheData(e);
    }
}