let capture;
let canvas;
let send = true;
let song;
let clapped = 0;
let pressed = false;
let last = 0;

function setup() {
    noCanvas();
    capture = createCapture({
        audio: false,
        video: {
            facingMode: {
                exact: "environment"
            }
        }
    });
    song = loadSound('sounds/button.mp3');

    mic = new p5.AudioIn();
    mic.start();
}

function touchEnded() {
    if (pressed) {
        pressed = false;
        console.log(capture);
        let video = capture.elt;
        var cc = document.createElement('canvas');
        cc.height = video.videoHeight;
        cc.width = video.videoWidth;
        var ctx = cc.getContext('2d');
        ctx.drawImage(video, 0, 0, cc.width, cc.height);

        $.post('/up', {
            img: cc.toDataURL("image/jpeg", 0.9)
        }, () => {
            song.play();
            
        });
        
        
    }
}
function touchStarted(){
    if(new Date().getTime()-last > 500){
        pressed = true;
        last = new Date().getTime();
    }
}