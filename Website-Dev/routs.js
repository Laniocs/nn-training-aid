var express = require('express');
var router = express.Router();
var path = require('path');
var crypto = require('crypto');
var builder = require('xmlbuilder');
var sizeOf = require('image-size');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

let idLibrary = [];

const imgSave = "dataset/imgs";
const annoSave = "dataset/annotations";

const getImagesfrom = "imgs/imgsToClassify";

router.get('/', function (req, res) {
    res.render("index", {
        title: 'Classify LEGOS'
    });
});

router.get("/imgId", async function (req, res) {
    const name = await getRandomFile();

    if (name === false) {
        res.send(JSON.stringify("NoImgsLeft"));
        return;
    }

    idLibrary.push({
        id: makeId(name),
        name: name,
        time: new Date().getTime()
    });

    //send a unique id
    res.send(JSON.stringify(idLibrary.find((e) => {
        return e.name == name;
    }).id));

});


router.get('/imgs', function (req, res) {
    const id = req.query.id;
    let pos;
    if (id.toString() === "NoImgsLeft" || id === undefined) {
        pos = "/imgs/sad/sad.jpg";
    } else {
        let name = idLibrary.find(e => {
            return e.id == id;
        }).name;
        pos = getImagesfrom + "/" + name;
    }
    res.setHeader('Content-Type', 'image/jpg');
    res.sendFile(path.join(__dirname, pos));
});

router.post('/receiveData', async function (req, res) {
    const data = req.body.value;
    const p = idLibrary.findIndex(e => {
        return e.id == data.id;
    });
    if(p == -1){
        res.send(JSON.stringify("error"));
        return;
    }

    if (data.points.length == 0) {
        fs.unlink(path.join(__dirname, getImagesfrom, idLibrary[p].name));
        idLibrary.splice(p, 1);
        res.send(JSON.stringify("deleted"));
        return;
    }

    const nn = new Date().getTime();
    nn = nn.toString() + Math.floor(Math.random() * 1000).toString();
    await fs.rename(path.join(__dirname, getImagesfrom, idLibrary[p].name), path.join(__dirname, `${imgSave}/${nn}.jpg`))

    makeXML(data.points, nn, sizeOf(path.join(__dirname, `${imgSave}/${nn}.jpg`)));
    idLibrary.splice(p, 1);
    res.send(JSON.stringify("done"));
});

router.get('/categories', function (req, res) {
    //JSON file in the /public/skills directory
    res.sendFile(__dirname + '/scripts/categories/categories.json');
});

function makeId(name) {
    return crypto.createHash('md5').update(name + new Date().getTime()).digest('hex');
}

async function getRandomFile() {
    const dir = path.join(__dirname, getImagesfrom);
    const res = await fs.readdirAsync(dir);
    const l = res.length;
    for (const i = 0; i < l; i++) {
        const bool = idLibrary.some(e => {
            return e.name == res[i];
        });

        if (!bool) {
            return res[i];
        }
    }
    return false;
}
//ICLUDE DEPTH DIFFERENCES!!!!

function makeXML(data, name = "fdas", dim = {
    width: 0,
    height: 0,
    depth: 0
}) {

    var root = builder.create('annotation');
    root.ele('folder').text("imgs");
    root.ele('filename').text(name + ".jpg");
    root.ele('segmented').text("0");
    //size
    const size = root.ele("size");
    size.ele("width").text(dim.width.toString());
    size.ele("height").text(dim.height.toString());
    size.ele("depth").text("3");

    //objects
    for (const i = 0; i < data.length; i++) {
        const obj = root.ele("object");
        const d = data[i];

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

    const res = root.end({
        pretty: true
    });
    fs.writeFile(path.join(__dirname, `${annoSave}/${name}.xml`), res);
}

//make variable router available for the other script
module.exports = router;