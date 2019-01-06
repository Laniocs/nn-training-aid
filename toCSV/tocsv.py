import os, os.path
import cv2
import numpy as np
from xml.dom import minidom
cwd = os.getcwd()

imagesFolder = "Images"
annotationsFolder = "Annotations"
csvFilename = "labels"

p = os.path.join(cwd,imagesFolder)

path, dirs, files = next(os.walk(p))
file_count = len(files)

def boxing(mydoc, f_name):
    items = mydoc.getElementsByTagName('object')
    for item in items:
        bb = item.getElementsByTagName("bndbox")[0]

        top_x = int(bb.getElementsByTagName("xmin")[0].firstChild.nodeValue)
        top_y = int(bb.getElementsByTagName("ymin")[0].firstChild.nodeValue)

        btm_x = int(bb.getElementsByTagName("xmax")[0].firstChild.nodeValue)
        btm_y = int(bb.getElementsByTagName("ymax")[0].firstChild.nodeValue)

        label = item.getElementsByTagName("name")[0].firstChild.nodeValue
        outp = imagesFolder + "/" + f_name + "," + str(top_x) + "," + str(top_y) + "," + str(btm_x) + "," + str(btm_y) + "," + str(label) + "\n"
        f.write(outp)

f= open( csvFilename + ".csv","w+")
for i in range(file_count):
    fxml_name = files[i].replace(".jpg",".xml").replace(".png",".xml")
    mydoc = minidom.parse(os.path.join(cwd, annotationsFolder, fxml_name))
    boxing(mydoc, files[i])