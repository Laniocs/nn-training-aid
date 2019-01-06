var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
const sharp = require('sharp');


router.post('/up', function (req, res) {


    var img = req.body.img;
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');

    const dir = path.join(__dirname, "dataset/uploaded");
    let saved;
    fs.readdir(dir, (errr, data) => {
        saved = dir + "/" + data.length + ".png";
        var n = data.length;
        fs.writeFile(saved, buf, () => {
            const dir2 = path.join(__dirname, "dataset/resized");
            let num = fs.readdirSync(dir2).length;
            fs.readFile(saved, (err, data) => {
                if (err) {
                    throw err;
                }
                //resize image
                sharp(data)
                    .resize(800, 800)
                    .max()
                    .jpeg()
                    .toFile(path.join(__dirname, "/dataset/resized/" + num + ".jpg"))
                    .then((err) => {
                        fs.unlink(path.join(__dirname, "/dataset/uploaded/" + n + ".png"), (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }).catch(err=>{
                        console.log(err);
                    });
            });
            res.send(JSON.stringify({
                id: "done" //req.file exists due to the upload...
            }));
        });
    });
});


router.get('/', function (req, res) {
    res.render("index");
});



//make variable router available for the other script
module.exports = router;
