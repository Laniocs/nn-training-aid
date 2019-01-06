

# import keras
import keras

# import keras_retinanet
from keras_retinanet import models
from keras_retinanet.utils.image import read_image_bgr, preprocess_image, resize_image
from keras_retinanet.utils.visualization import draw_box, draw_caption
from keras_retinanet.utils.colors import label_color

# import miscellaneous modules
import matplotlib.pyplot as plt
import cv2
import os
import numpy as np
import time

# set tf backend to allow memory to grow, instead of claiming everything
import tensorflow as tf

def get_session():
    config = tf.ConfigProto()
    config.gpu_options.allow_growth = True
    return tf.Session(config=config)

import sys


def listen():
    while True:
        path = sys.stdin.readline()
        path = path.split('\n')[0]
        if path:
            if path == "stap":
                break
            #make a guess
            path = str(path)
            image = read_image_bgr(imgloc + "/" + path)
            image = preprocess_image(image)
            image, scale = resize_image(image)
            boxes, scores, labels = model.predict_on_batch(np.expand_dims(image, axis=0))
            boxes /= scale
            msg = []
            for box, score, label in zip(boxes[0], scores[0], labels[0]):
                # scores are sorted so we can break
                if score < 0.5:
                    break
        
                color = label_color(label)
                b = box.astype(int)
                msg.append({"topleft":{"x":b[0],"y":b[1]},"bottomright":{"x":b[2],"y":b[3]},"label":labels_to_names[label],"confidence":score})
            print("#" + path + "#" + str(msg) + "#")
            sys.stdout.flush()
            #stop command
            


if __name__ == '__main__':
    sys.stdout.flush(

    #---------change dir set path to RetinaNet-master!!!-----------------#
    os.chdir("path/to/keras-retinanet-master")
    #---------change dir set path to RetinaNet-master!!!-----------------#

    imgloc = sys.argv[1]
    keras.backend.tensorflow_backend.set_session(get_session())
    
    #--------perhaps change the Model?-----------------------------------#
    model_path = os.path.join('snapshots', '5_Legos_RetinaNet-50.h5')
    #--------perhaps change the Model?-----------------------------------#

    model = models.load_model(model_path, backbone_name='resnet50')

    labels_to_names = {0:"3001", 1:"3009",2:"3005",3:"3007",4:"3003"}

    print("imloaded")
    print("[YOLO]:  " + imgloc)
    sys.stdout.flush()


    listen()