import os, os.path
import cv2
import numpy as np
from xml.dom import minidom
cwd = os.getcwd()

p = cwd + "/imgs"
path, dirs, files = next(os.walk(p))
file_count = len(files)
print(file_count)

def boxing(original_img, mydoc):
    newImage = np.copy(original_img)
    items = mydoc.getElementsByTagName('object')
    for item in items:
        bb = item.getElementsByTagName("bndbox")[0]

        top_x = int(bb.getElementsByTagName("xmin")[0].firstChild.nodeValue)
        top_y = int(bb.getElementsByTagName("ymin")[0].firstChild.nodeValue)

        btm_x = int(bb.getElementsByTagName("xmax")[0].firstChild.nodeValue)
        btm_y = int(bb.getElementsByTagName("ymax")[0].firstChild.nodeValue)

        label = item.getElementsByTagName("name")[0].firstChild.nodeValue
        newImage = cv2.rectangle(newImage, (top_x, top_y), (btm_x, btm_y), (255,0,0), 10)
        newImage = cv2.putText(newImage, label, (top_x, top_y-5), cv2.FONT_HERSHEY_DUPLEX , 3, (0, 0, 0), 5, cv2.LINE_AA)
            
    return newImage

for i in range(file_count):
    mydoc = minidom.parse(cwd + "/annotations/" + files[i].replace(".jpg",".xml"))
    print(files[i])
    original_img = cv2.imread(cwd + "/imgs/" + files[i],1)
    resized_image = cv2.resize(boxing(original_img,mydoc), (0,0), fx=0.25, fy=0.25) 
    cv2.imshow(str(i)+".jpg",resized_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()