//load a random Image!
let url = "/imgs";
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let temp;
let moving;
let img;

//Download a random imgage
function drawImg() {
    if (img === undefined) {
        makeRequest("GET", "/imgId", function (err, res) {
            let imgId = res.replace(/\"/ig, "");
            if (imgId == "NoImgsLeft") {
                console.log("Not imgs left");
                return;
            }
            img = new Image();
            img.onload = function () {
                document.getElementById('canvas').width = img.width;
                document.getElementById('canvas').height = img.height;
                ctx.drawImage(img, 0, 0); // destination rectangle
                points.id = imgId;
            };
            let burl = url + "?id=" + imgId;
            img.src = burl;
        });
    } else {
        ctx.drawImage(img, 0, 0); // destination rectangle
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
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

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
        if (moving == true) {
            points.points.push({
                f: temp,
                s: coords,
                id: $("#parts").find(":selected").text().replace(/\|.*$/,"").replace(/\s/ig,""),
                c: $("#parts").val()
            });
            temp = undefined;
            moving = false;
            console.log(points);
            return;
        }
        if ($("#parts").val() !== null && img != undefined) {
            coords = canvas.relMouseCoords(event);
            temp = coords;
            moving = true;
        }
    } else if (ev.button == 2) {
        coords = canvas.relMouseCoords(event);
        let p = points.points;
        for (let i in points.points) {
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
        console.log(temp, coords);
        let top_l = {x: (temp.x < coords.x)? temp.x : coords.x,y: (temp.y < coords.y)? temp.y : coords.y};
        let bot_r = {x: (temp.x > coords.x)? temp.x : coords.x,y: (temp.y > coords.y)? temp.y : coords.y};
        points.points.push({
            f: top_l,
            s: bot_r,
            id: $("#parts").find(":selected").text().replace(/\|.*$/,"").replace(/\s/ig,""),
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
    for (let i = 0; i < points.points.length; i++) {
        drawRect(points.points[i].f, points.points[i].s, points.points[i].c);
        console.log(points.points[i]);
    }
    if (coords !== undefined && temp !== undefined) {
        drawRect(temp, coords, $("#parts").val());
    }
};

window.onload = function () {
    drawImg();
    //get all categories from my "database"
    $.get('categories/', function (data) {

        for (var j = 0; j < data.length; j++) {
            $('#parts').append($('<option></option>').val(data[j].color).html(data[j].id + "|" + data[j].shape).css("background-color", data[j].color));
        }

        $(document).keypress(function (e) {
            let k = e.keyCode;
            console.log(k)
            for(let i in data){
                if(k == 49 + parseInt(i) && i < 8){
                    $('#parts').val(data[i].color);
                    $('#parts').css("background-color", data[i].color);
                    break;
                }
            }
        });
    });
};
$('#parts').on('change', function () {
    $('#parts').css("background-color", this.value);
});

document.addEventListener('contextmenu', event => event.preventDefault());