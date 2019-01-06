var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
var crypto = require('crypto');
var builder = require('xmlbuilder');
var sizeOf = require('image-size');

let idLibrary = [];

const imgSave = "dataset/imgs";
const annoSave = "dataset/annotations";

const getImagesfrom = "imgs/imgsToClassify";

router.get('/', function (req, res) {
    res.render("index", {
        title: 'Classify LEGOS'
    });
});

router.get("/imgId", function (req, res) {
    let name = getRandomFile();
    name.then(
        //if resolved
        function (fn) {
            //save that we used this file
            idLibrary.push({
                id: makeId(fn),
                name: fn,
                time: new Date().getTime()
            });
            //send a unique id
            res.send(JSON.stringify(idLibrary.find((e) => {
                return e.name == fn;
            }).id));

        },
        //rejected
        function(fn){
            res.send(JSON.stringify("NoImgsLeft"));
            return;
        }
    );

});


router.get('/imgs', function (req, res) {
    let id = req.query.id;
    let name = idLibrary.find(e => {
        return e.id == id;
    }).name;

    let pos = getImagesfrom + "/" + name;
    if (name === undefined) {
        pos = "/imgs/sad/sad.jpg";
    }
    res.setHeader('Content-Type', 'image/jpg');
    res.sendFile(path.join(__dirname, pos));
});

router.post('/receiveData', function (req, res) {
    let data = req.body.value;
    let p = idLibrary.findIndex(e => {
        return e.id == data.id;
    });

    if (data.points.length == 0) {
        fs.unlink(path.join(__dirname, getImagesfrom, idLibrary[p].name));
        idLibrary.splice(p, 1);
        res.send(JSON.stringify("deleted"));
        return;
    }

    let nn = new Date().getTime();
    nn = nn.toString() + Math.floor(Math.random() * 1000).toString();

    fs.rename(path.join(__dirname, getImagesfrom, idLibrary[p].name), path.join(__dirname, `${imgSave}/${nn}.jpg`), (err) => {
        makeXML(data.points, nn, sizeOf(path.join(__dirname, `${imgSave}/${nn}.jpg`)));
        idLibrary.splice(p, 1);
        res.send(JSON.stringify("done"));
    });




});

router.get('/categories', function (req, res) {
    //JSON file in the /public/skills directory
    res.sendFile(__dirname + '/scripts/categories/categories.json');
});

function makeId(name) {
    return crypto.createHash('md5').update(name + new Date().getTime()).digest('hex');
}

function getRandomFile() {
    return new Promise(function (resolve, reject) {
        const dir = path.join(__dirname, getImagesfrom);
        let res = fs.readdirSync(dir);
        let l = res.length;
        for (let i = 0; i < l; i++) {
            let bool = idLibrary.some(e => {
                return e.name == res[i];
            });

            if (!bool) {
                resolve(res[i]);
            }
        }
        reject(false);
    });
}
//ICLUDE DEPTH DIFFERENCES!!!!

function makeXML(data, name , dim = {
    width: 0,
    height: 0,
    depth: 0
}) {

    var root = builder.create('annotation');
    root.ele('folder').text("imgs");
    root.ele('filename').text(name + ".jpg");
    root.ele('segmented').text("0");
    //size
    let size = root.ele("size");
    size.ele("width").text(dim.width.toString());
    size.ele("height").text(dim.height.toString());
    size.ele("depth").text("3");

    //objects
    for (let i = 0; i < data.length; i++) {
        let obj = root.ele("object");
        let d = data[i];

        obj.ele("name").text(d.id);
        obj.ele("pose").text("Unspecified");
        obj.ele("truncated").text("0");
        obj.ele("difficult").text("0");

        let bounding = obj.ele("bndbox");

        bounding.ele("xmin").text(d.f.x.toString());
        bounding.ele("ymin").text(d.f.y.toString());
        bounding.ele("xmax").text(d.s.x.toString());
        bounding.ele("ymax").text(d.s.y.toString());
    }

    let res = root.end({
        pretty: true
    });
    fs.writeFile(path.join(__dirname, `${annoSave}/${name}.xml`), res, function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

//make variable router available for the other script
module.exports = router;