var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
var crypto = require('crypto');
var builder = require('xmlbuilder');

//storage things
var sizeOf = require('image-size');
const multer = require("multer");
const sharp = require('sharp');
let {
    PythonShell
} = require('python-shell');

let idLibrary = [];




//# SHELL STARTING FOR PYTHON WHICH RUNS THE NEURAL NET #//
let shellOptions = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    args: [__dirname + "/dataset/resized"] //set the Path to all following pictures!
};

//start the python script
let shell;
console.log("Retinanet - Mode:");
console.log("Wait for the Nerual Network to be loaded!");

//----------change to your Location of keras-retinanet-master and my programm classify.py-------------//
shell = new PythonShell("path/to/keras-retinanet-master/classify.py", shellOptions);
//----------change to your Location of keras-retinanet-master and my programm classify.py-------------//

//Answer the Python
function handleAnswer(a) {
    if (a.toString() == "imloaded") {
        console.log("[Retinanet]:    I'm loaded");
        return;
    } else {
        let msg = a.toString();
        let regex = /^\#(.*)\#(.*)\#$/;
        let bool = a.match(regex);
        if (bool != undefined) {
            let name = a.replace(regex, "$1");
            let index = idLibrary.findIndex(ele => {
                return ele.name === name;
            });
            if (index == -1) return;
            idLibrary[index].values = a.replace(regex, "$2");
            idLibrary[index].classified = true;
        }
    }
}

shell.on('message', function (message) {
    handleAnswer(message);
});




//# STORAGE HANDLER #//

//storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './dataset/uploaded/');
    },
    filename: function (req, file, cb) {
        let name = new Date().getTime().toString() + file.originalname;
        let id = crypto.createHash('md5').update(name).digest('hex');
        idLibrary.push({
            name: name,
            id: id,
            classified: false,
            values: undefined
        });
        file.id = id;
        cb(null, name);
    }
});

//make sure only right pictures
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 6024 * 6024 * 5
    },
    fileFilter: fileFilter
});





//# HANDLER FOR THE CLASSIFY REQUEST #//

router.post('/upImg', upload.single('foto'), function (req, res) {
    //see if worked 
    if (req.file === undefined) {
        res.send(JSON.stringify("err"));
        return;
    }
    //get name without ending(e.g. .jpg, .png, ...)
    let n = req.file.filename.replace(/^(.*)(\.)[^\.]*$/, "$1");
    fs.readFile(req.file.path, (err, data) => {
        if (err) {
            throw err;
        }
        //resize image
        sharp(data)
            .resize(800, 800)
            .max()
            .jpeg()
            .toFile(path.join(__dirname, "/dataset/resized/" + n + ".jpg"))
            .then(() => {
                fs.unlink(path.join(__dirname, "/dataset/uploaded/" + req.file.filename), (err) => {
                    if (err) {
                        throw err;
                    }
                });
                //make Neural Network Stuff and send it!
                shell.send(req.file.filename);

                //waiting for a result!
                waitForPython(req.file.filename, (values, id) => {
                    //send the Id back and Boxes!
                    res.send(JSON.stringify({
                        id: id, //req.file exists due to the upload...
                        values: values //send Boxes
                    }));
                });
            });
    });
});

function waitForPython(name, cb) {
    // TODO Promise + delete idLib!!!
    let interval = setInterval(_ => {
        let index = idLibrary.find(ele => {
            return ele.name === name;
        });
        
        if (index.classified == true) {
            cb(index.values, index.id);
            clearInterval(interval);
            
        }
    }, 100);
}

function toLibrary(name) {
    if (name === undefined) {
        return undefined;
    }
    if(idLibrary != [])console.log(idLibrary)
    //save that we used this file
    idLibrary.push({
        id: makeId(name),
        name: name,
        time: new Date().getTime()
    });
    //return a unique id
    let id = idLibrary.find((e) => {
        return e.name == name;
    }).id;

    return id;
}

function makeId(name) {
    return crypto.createHash('md5').update(name + new Date().getTime()).digest('hex');
}

//send Categories

router.get('/categories', function (req, res) {
    //JSON file in the /public/skills directory
    res.sendFile(__dirname + '/public/categories.json');
});


//# Normal reques handling #//
router.get('/', function (req, res) {
    res.render("index", {
        title: 'Lego'
    });
});

//make variable router available for the other script
module.exports = router;