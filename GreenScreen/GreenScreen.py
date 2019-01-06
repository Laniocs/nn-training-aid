import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import random
import time
from generate_xml import write_xml
import math
import numpy as np
#constants
dir_path = os.path.dirname(os.path.realpath(__file__))
image_folder = os.path.join(dir_path,"TransparentImages")
background_folder = os.path.join(dir_path,"BackgroundImages")
savedir_img = os.path.join(dir_path,"AnnotatedImages","Images")
savedir_anno  = os.path.join(dir_path,"AnnotatedImages", "Annotations")

annotatedImagesPerTransparent = 5
#Time
current_milli_time = lambda: int(round(time.time() * 1000))

def handleImage(url,width,height, pos, number):
    legos = []
    for i in range(number):
        lego = Image.open(url[i], 'r')
        maximum = 100
        for j in range(addImgs_number):
            if width / addImgs_number * j < x and width / addImgs_number * (j + 1) > x:
                maximum = height / addImgs_number * (j + 1) - pos[i][0]
        #reshape
        basewidth = 0
        if maximum > 100:
            basewidth = random.randint(100,int(maximum))
        else:
            basewidth = 100
        wpercent = (basewidth/float(lego.size[0]))
        hsize = int((float(lego.size[1])*float(wpercent)))
        s = False
        if(hsize + pos[i][1] > height or pos[i][0] + basewidth > width):
            s = True
            if(hsize + pos[i][1]-height > pos[i][0] + basewidth - width):
                
                hsize = height - pos[i][1]
                if hsize < 0:
                    hsize = 100
                wpercent = (hsize/float(lego.size[1]))
                basewidth = int((float(lego.size[0])*float(wpercent)))
            else: 
                basewidth = width - pos[i][0]
                if basewidth < 0:
                    basewidth = 100
                wpercent = (basewidth/float(lego.size[0]))
                hsize = int((float(lego.size[1])*float(wpercent)))

        #resize and shape random...
        if(basewidth < 0 or hsize < 0):
            print(basewidth, hsize)

        lego = lego.resize((basewidth,hsize), Image.ANTIALIAS).rotate(random.randint(0,360), expand = 1)
        
        legos.append(lego)
    return legos, False


def getEdges(image):
    im_arr = np.asarray(image)
    array = np.argwhere((im_arr != [0,0,0,0]).all(axis=2))
    y_list = [array[0][0],array[len(array)-1][0]] #ymin, ymax
    x_list = [math.inf,0]
    for i in array:
        if i[1] > x_list[1]:
            x_list[1] = i[1]
        if i[1] < x_list[0]:
            x_list[0] = i[1]
    return x_list, y_list


def makeAnnos(lego, top_l_arr, name, width, height, n):
    out_top_l = []
    out_bot_r = []
    for l in range(len(lego)):
        xmin,ymin = getEdges(lego[l])
        top_l = top_l_arr[l]

        stop_l = top_l
        top_l = (top_l[0] + xmin[0] - 5, top_l[1] + ymin[0] - 5)
        bot_r = (stop_l[0] + xmin[1] + 5, stop_l[1] + ymin[1] + 5)
        out_top_l.append(top_l)
        out_bot_r.append(bot_r)
    write_xml("Images", [width,height,3], n, out_top_l, out_bot_r, savedir_anno, name)

def getLowestDir(howmany, imgf):
    res = 0
    r = random.randint(0,10)
    if r < 8:
        for i in range(len(howmany) - 1):
            if howmany[i + 1] <= howmany[res]:
                res = i + 1
    else:
        res = random.randint(0,len(howmany)-1)
    howmany[res] += 1
    return imgf[res], howmany


print(image_folder)
dir_lists = [x[0] for x in os.walk(image_folder)]
howmany = [0 for x in os.listdir(image_folder)]
dir_lists.pop(0)
for direct in dir_lists:
    print("Next Folder")
    for i in range(annotatedImagesPerTransparent):
        for n, image_file in enumerate(os.scandir(direct)):
        
            #background path
            background_path = random.choice(os.listdir(background_folder)) 
            background = Image.open(background_folder + "/" + background_path, 'r')
            #handle background
            width, height = background.size
            if width < 300 or height < 300: break
        
            text_img = Image.new('RGBA', (width,height), (0, 0, 0, 0))
            text_img.paste(background, (0,0))

            #imgpath
            image_path = image_file.path
            
            #number of transparent images per annotated image
            addImgs_number = random.randint(1,4)
            
            addImgs_paths = [image_path]
            adImg = direct.split("\\")
            addImgs_names = [adImg[len(adImg)-1]]
            addImgs_top_l = []
            addImgs = []
            for i in range(addImgs_number - 1):
                add_folder_name = random.choice(os.listdir(image_folder))
                addImgs_names.append(add_folder_name)
                add_folder = image_folder + "/" + add_folder_name
                path = add_folder + "/" + random.choice(os.listdir(add_folder)) 
                addImgs_paths.append(path)

            
            if random.randint(0,100) > 60:
                text_img = text_img.filter(ImageFilter.GaussianBlur(random.randint(1,2)))

            #make legos
            for i in range(addImgs_number):
                x = random.randint( 0 , int(width - 100))
                y = random.randint( 0 , int(height - 100))
                addImgs_top_l.append([x,y])
            legos, s = handleImage(addImgs_paths, width, height, addImgs_top_l, addImgs_number)

            #put together
            i = 0
            for lego in legos:
                text_img.paste(lego, (addImgs_top_l[i][0],addImgs_top_l[i][1]), mask=lego)
                i = i + 1
            

            #contrast
            enhancer = ImageEnhance.Contrast(text_img)
            text_img = enhancer.enhance(random.uniform(0.6, 1))
            
            #saturation changing
            converter = ImageEnhance.Color(text_img)
            text_img = converter.enhance(random.uniform(0.7, 2))
            
            if s:
                text_img.show()

            name = str(current_milli_time())
            text_img.save( savedir_img + "/" + name  + ".png", format="png")
            
            #write annotations
            makeAnnos(legos, addImgs_top_l, name, width, height, addImgs_names)


