# Aid for Training Neural Networks for Object Classification
I trained a RetinaNet to classify 5 LEGOs. You can find the weights [here](https://drive.google.com/drive/folders/1B5xsQ912e5_-g6kAD0DQYQ9Z8OppjXKB?usp=sharing).
Here are some Programs which might help you train and using a RetinaNet or a YOLOv2. For this I used the ["keras-retinanet"](https://github.com/fizyr/keras-retinanet) Library. It is essential that you install it properly before you use the program "Website". I used Node.js V8.12.0 and Python V3.5.0.
* Fotostation - Creates a server. You can take Fotos with any device and it will be uploaded on this server. You NEED to make your own Server Certificates! [Here](https://flaviocopes.com/express-https-self-signed-certificate/) is a Turorial. Tested on Android.
* Website-Dev - When you place Images in the imgs/imgsToClassifiy folder, you can annotate them via Browser
* GreenScreen - Generate an artificial Dataset. You need png Images with transparent Background and images as Backgrounds
* toCSV - Translate .xml annotations into one .csv annotation
* Website - If configured properly (classify.py got copied in the keras-retinanet-master folder, the weights got downloaded and copied in the keras-retinanet-master/snapshots folder and in routs.js and classify.py the Path got changed) you can visit this Website, upload your Image and it will be classified.

## Installation
1. Install Node.js V8.12.0 and keras-retinanet (Python 3.5.0)
2. Every Node.js program-folder run ´npm install´
3. If you want to launch Fotostation, Website or Website-Dev use the ´node server.js´ command

### Fotostation
After finishing the previous steps you need to make a certificate. Make it using [openssl](https://www.openssl.org/). Paste the Certificates in the Folder and make sure that they are named the same as referenced in the server.js file.

### Website
Firstly you need to install keras-retinanet. If you have installed it properly just paste in the keras-retinanet-master folder the classify.py script. You will NEED to edit the file. You will need to specify ´os.chdir´. Reference where your keras-retinanet-master folder is located. Then you NEED to edit the roots.js file. You must edit the shell variable. Also there reference you keras-retinanet-master folder.
