# Aid for Training Neural Networks for Object Classification
I trained a RetinaNet to classify 5 LEGOs. You can find the weights [here](https://drive.google.com/drive/folders/1B5xsQ912e5_-g6kAD0DQYQ9Z8OppjXKB?usp=sharing).
Here are some Programs which might help you train and using a RetinaNet or a YOLOv2. For this I used the "keras-retinanet" Library. It is essential that you install it properly before you use the program "Website". I used Node.js V8.12.0 and Python V3.5.0.
* Fotostation - Creates a server. You can take Fotos with any device and it will be uploaded on this server. You NEED to make your own Server Certificates! Tested on Android.
* Website-Dev - When you place Images in the imgs/imgsToClassifiy folder, you can annotate them via Browser
* GreenScreen - Generate an artificial Dataset. You need png Images with transparent Background and images as Backgrounds
* toCSV - Translate .xml annotations into one .csv annotation
* Website - When configured properly (classify.py got copied in the keras-retinanet-master folder, the weights got downloaded and copied in the keras-retinanet-master/snapshots folder and in routs.js and classify.py the Path got changed) you can visit this Website, upload your Image and it will be classified.
