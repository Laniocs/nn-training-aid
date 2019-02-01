let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let img = new Image();
let boxes = [];
let ratio;
let temp;
let moving = false;
let valueMode = false;
let id;
let values;
let all;
const url = "/getImgById";
let lowestConfidence = 0.5;
//# LOADING AND SENDING OF THE UPLOAD IMAGE #//

//Load the image
document.getElementById('inp').onchange = function (e) {
    img.onload = onLoadFunction;
    img.onerror = failed;
    img.src = URL.createObjectURL(this.files[0]);
    boxes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function failed() {
    console.error("The provided file couldn't be loaded as an Image media");
}

function onLoadFunction() {
    sendPic();
    draw();
}

//sending the picture
async function sendPic() {
    let formData = new FormData();

    let a = document.getElementById('inp').files[0];
    formData.append('foto', a);
    let msg = await upImg("/upImg", "POST", formData)
    msg = msg.values.replace(/\'/ig, "\"");
    msg = JSON.parse(msg);
    for (let ms of msg) {
        if (ms.confidence > lowestConfidence) {
            let m = mulBox(ms, ratio);
            if (all != undefined) {
                let jData = all.findIndex(ele => {
                    return ele.id === m.label;
                });
                m.label = all[jData].shape;
            }
            boxes.push(m);
        }
    }
    draw();
}




//# DRAW HANDLER #//

//draw things!
function drawBox(obj1, obj2, label, color = "#ff00ff") {
    ctx.beginPath();
    const x = obj1.x;
    const y = obj1.y;
    const w = obj2.x - x;
    const h = obj2.y - y;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.font = "25px arial";
    ctx.strokeText(label, x, y - 5);
    ctx.fillText(label, x, y - 5);

    ctx.stroke();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
}

//draw AND resizing of the canvas depending on the windowidth AND ratio definition
function draw() {
    const elemRect = document.getElementById("inp").getBoundingClientRect();
    const maxH = window.innerHeight - elemRect.y;
    const maxW = window.innerWidth * 0.9;
    const w = img.width;
    const h = img.height;
    const perH = h / maxH;
    const perW = w / maxW;

    if (perH > 1 || perW > 1) {
        if (perH <= perW) {
            canvas.width = maxW;
            canvas.height = h / perW;
        } else {
            canvas.height = maxH;
            canvas.width = w / perH;
        }
    } else {
        canvas.height = h;
        canvas.width = w;
    }
    //800 is he size the picture is saved on the server!
    //therefore boxes is calculated for 800
    ratio = (w >= h) ? canvas.width / 800 : canvas.height / 800;

    //draw it
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (let box of boxes) {
        drawBox(box.topleft, box.bottomright, box.label + " " + box.confidence + "%", box.c);
    }

}



//sizing the oxes to the image width of user
function mulBox(obj, m) {
    let res = clone(obj);
    res.confidence = Math.floor(res.confidence * 100);
    res.topleft = {
        x: Math.round(obj.topleft.x * m),
        y: Math.round(obj.topleft.y * m)
    };
    res.bottomright = {
        x: Math.round(obj.bottomright.x * m),
        y: Math.round(obj.bottomright.y * m)
    };
    return res;
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}






//# ALL EVENT HANDLERS #//


//format it right
function gateWay(id, box) {
    let endBox = [];
    draw(); // again just for the ratio
    for (b of box) {
        endBox.push(mulBox(b, 1 / ratio));
    }

    return {
        id: id,
        boxes: endBox
    }
}

window.onload = async function () {
    all = await makeRequest("GET", 'categories/');
};


//prevent the rightcklick menu
window.addEventListener("contextmenu", e => {
    e.preventDefault();
});