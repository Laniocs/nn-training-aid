//load a random Image!
const url = "/imgs";
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let temp;
let moving;
let img;
let ratio;
let denySend = false;


//Download a random imgage
async function drawImg() {
    if (img === undefined) {
        let res = await makeRequest("GET", "/imgId");
        img = new Image();
        if (res == "NoImgsLeft") denySend = true;
        img.onload = function () {
            const c = canvas.getBoundingClientRect().y;
            const d = document.getElementById("send").getBoundingClientRect().height;
            const e = document.getElementById("parts").getBoundingClientRect().height;
            const maxH = window.innerHeight - (c + d + 2 * e);
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
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // destination rectangle
            points.id = res;
            ratio = img.width / canvas.width
        };
        img.src = url + "?id=" + res;
    } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // destination rectangle
    }
}

function drawRect(obj1, obj2, color = "#000000") {
    ctx.beginPath();
    ctx.rect(obj1.x, obj1.y, obj2.x - obj1.x, obj2.y - obj1.y);
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.stroke();
}


//https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element

function relMouseCoords(event) {
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let canvasX = 0;
    let canvasY = 0;
    let currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {
        x: canvasX,
        y: canvasY
    };
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

canvas.onmousedown = function (ev) {
    if (ev.button === 0) {
        if (moving) {
            points.points.push({
                f: temp,
                s: coords,
                id: $("#parts").find(":selected").text().replace(/\|.*$/, "").replace(/\s/ig, ""),
                c: $("#parts").val()
            });
            temp = undefined;
            moving = false;
            return;
        }
        if ($("#parts").val() !== null && img != undefined) {
            coords = canvas.relMouseCoords(event);
            temp = coords;
            moving = true;
        }
    } else if (ev.button == 2) {
        coords = canvas.relMouseCoords(event);
        const p = points.points;
        for (const i in points.points) {
            if (p[i].f.x < coords.x && p[i].s.x > coords.x && p[i].f.y < coords.y && p[i].s.y > coords.y) {
                points.points.splice(i, 1);
            }
        }

    }
};
canvas.onContextMenu = function () {
    return false;
};
canvas.onmouseup = function () {
    coords = canvas.relMouseCoords(event);
    if (moving) {
        let top_l = {
            x: (temp.x < coords.x) ? temp.x : coords.x,
            y: (temp.y < coords.y) ? temp.y : coords.y
        };
        let bot_r = {
            x: (temp.x > coords.x) ? temp.x : coords.x,
            y: (temp.y > coords.y) ? temp.y : coords.y
        };
        points.points.push({
            f: top_l,
            s: bot_r,
            id: $("#parts").find(":selected").text().replace(/\|.*$/, "").replace(/\s/ig, ""),
            c: $("#parts").val()
        });
        temp = undefined;
        moving = false;
    }
};

window.onmousemove = function () {
    coords = canvas.relMouseCoords(event);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawImg();
    for (let i in points.points) {
        drawRect(points.points[i].f, points.points[i].s, points.points[i].c);
    }
    if (coords !== undefined && temp !== undefined) {
        drawRect(temp, coords, $("#parts").val());
    }
};

window.onload = async function () {
    drawImg();
    //get all categories from my "database"
    let data = await makeRequest("GET", "categories/");

    for (const i in data) {
        $('#parts').append($('<option></option>').val(data[i].color).html(data[i].id + "|" + data[i].shape).css("background-color", data[i].color));
    }

    $(document).keypress(function (e) {
        const k = e.keyCode;
        for (const i in data) {
            if (k == 49 + parseInt(i) && i < 8) {
                $('#parts').val(data[i].color);
                $('#parts').css("background-color", data[i].color);
                break;
            }
        }
    });
};
$('#parts').on('change', function () {
    $('#parts').css("background-color", this.value);
});

document.addEventListener('contextmenu', event => event.preventDefault());