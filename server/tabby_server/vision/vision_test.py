from flask import Blueprint, send_file, request
import os
from io import BytesIO
from http import HTTPStatus
from google.cloud import vision
import json
from PIL import Image, ImageFont, ImageDraw
from numpy import random

'''
This is a template to use the google vision api library. This has two parts.
The first part covers object localization. The second covers Optical Character
Recognition (OCR).

To my understanding, you do not need Google Cloud CLI for this to work.
But just in case, here is the installation link.
https://cloud.google.com/sdk/docs/install

Documentation
    https://cloud.google.com/vision/docs
    https://cloud.google.com/vision/docs/features-list

    https://cloud.google.com/vision/docs/setup
    https://cloud.google.com/vision/docs/libraries

At the bottom are two functions to retrieve the outputs given by the api calls
and draw boxes around the original images. If the api has not been called yet,
it will instead return already generated results from testing instead.

This output is an image and is given directly to the browser with text boxes
and labels (if there are any returned by google!).
'''

# Blueprint for this file. Adds the 'test' prefix in __main__.py.
# To call functions in this file use "/test/<function_route>"
vision_test = Blueprint('vision_test', __name__)

# Necessary to authenticate to our project. Uses pregenerated service account.
# This is a different API key than Google Books.
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""
# Change "" to be whatever path is to your service key token json. The path
# should be from __main__.py.

'''
https://cloud.google.com/vision/docs/object-localizer

This covers Object Localization for google vision api.

localize_objects is a given function from the docs.
Use google_vision_obj_test to make an api call and get a return.

localize_objects has been slightly modified to provide a useful return.

Example Videos:
https://youtu.be/i2yFD8PsMvQ?list=PLkTmsEazx3GVcEtCSLauTw4x4NgTSEGqM
https://youtu.be/nyTiWOZYHfE?list=PL3JVwFmb_BnSLFyVThMfEavAEZYHBpWEd

'''


def localize_objects(path):
    # This is a given function from the google website on how to implement
    # object localization into the project.

    """Localize objects in the local image.

    Args:
    path: The path to the local file.
    """

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()
    image = vision.Image(content=content)

    obj = client.object_localization(image=image).localized_object_annotations

    # Stores all results in a list.
    obj_result = []

    for object_ in obj:
        # For each object found, it will save the name and confidence in a
        # dict. Along with the bounding vertices.
        obj_object = {}
        obj_object['name'] = object_.name
        obj_object['confidence'] = object_.score
        obj_object['bounds'] = {}

        i = 1
        for vertex in object_.bounding_poly.normalized_vertices:
            obj_object['bounds']["vertex_" + str(i)] = {'x': vertex.x,
                                                        'y': vertex.y}
            i = i + 1

        # Adds the object to the list of objects found.
        obj_result.append(obj_object)

    return obj_result


# Class to hold data
class shelves_images:
    picts = []
    result = {}


shelf = shelves_images()


# Calls the localize_objects function with an image of books on shelves.
# Unique api calls must be used for each image.

# Copy of output is located in "example_shelves".

@vision_test.route('/obj_request', methods=["GET"])
def google_vision_obj_test():
    # Only calls if nothing has been returned before.
    if not bool(shelf.result):

        # Add shelf images to be checked
        # Only shelf_5 returns anything when tested.
        # shelf.picts.append("vision/example_shelves/shelf_1.jpg")
        # shelf.picts.append("vision/example_shelves/shelf_2.jpg")
        # shelf.picts.append("vision/example_shelves/shelf_3.jpg")
        # shelf.picts.append("vision/example_shelves/shelf_4.jpg")
        shelf.picts.append("vision/example_shelves/shelf_5.jpg")
        # shelf.picts.append("vision/example_shelves/shelf_6.jpg")
        # shelf.picts.append("vision/example_shelves/shelf_7.jpg")

        # Loops through images
        for i in range(len(shelf.picts)):
            shelf.result["shelf " + str(i + 1)] = (
                localize_objects(shelf.picts[i]))

    # Returns the complete output of the API call.
    return shelf.result, HTTPStatus.OK


'''
https://cloud.google.com/vision/docs/ocr

This covers Optical Character Recognition (OCR) for google vision api.

detect_text is a given function from the docs (with a slightly modified
output). Use google_vision_ocr_test to make an api call and get a return.

The return from the api call has already been recorded in the "example_covers"
file.

Example Video: https://youtu.be/hkKKfEqZvn4
'''


def detect_text(path):
    # This is the given function from the google website on how to implement
    # OCR into the project.

    """Detects text in the file."""

    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations

    # Stores the results in a list
    ocr_result = []

    for text in texts:

        # Stores individual book info in a dict.
        ocr_text = {}

        # Says what it found.
        ocr_text["text"] = f'\n"{text.description}"'

        # Says where it found it.
        vertices = [
            f"({vertex.x},{vertex.y})" for vertex
            in text.bounding_poly.vertices
        ]
        ocr_text["bounds"] = format(",".join(vertices))

        # Appends it to the end of the list to be returned.
        ocr_result.append(ocr_text)

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format
            (response.error.message)
        )

    # Returns the list
    return ocr_result


# Class to hold data
class books_sides:
    covers = []
    shells = []
    texts = {}


book = books_sides()


# Calls the detect_text function for a check of each book image and returns the
# results. For each image above, a unique api call must be used to get a
# result. Be wary, we only have 1000 per month total.

# This output is in a text file in "example_covers"

@vision_test.route('/ocr_request', methods=["GET"])
def google_vision_ocr_test():
    # Only calls if nothing has been returned before.
    if not bool(book.texts):

        # Add books to be checked
        book.covers.append("vision/example_covers/front_1.jpg")
        book.covers.append("vision/example_covers/front_2.jpg")
        book.covers.append("vision/example_covers/front_3.jpg")
        book.covers.append("vision/example_covers/front_4.jpg")
        book.covers.append("vision/example_covers/front_5.jpg")
        book.covers.append("vision/example_covers/front_6.jpg")
        book.covers.append("vision/example_covers/front_7.jpg")
        book.shells.append("vision/example_covers/back_1.jpg")
        book.shells.append("vision/example_covers/back_2.jpg")
        book.shells.append("vision/example_covers/back_3.jpg")

        # Loops through front covers.
        for i in range(len(book.covers)):
            book.texts["front " + str(i + 1)] = detect_text(book.covers[i])

        # Loops through back covers.
        for i in range(len(book.shells)):
            book.texts["back " + str(i + 1)] = detect_text(book.shells[i])

    # Returns the complete output of the API call.
    return book.texts, HTTPStatus.OK


'''
This section covers the drawing of the Localization and OCR of the test
images. If called after one or both of the other two, this will return based
on their result. Otherwise, it will return based on the test results saved.

The bound is limited and if you call outside this bound it returns a
pre-determined test output instead.

https://pillow.readthedocs.io/en/stable/
'''


# Global variables for the range of the randomly generated color shapes.
upp_lim = 255
bot_lim = 150


# Uses query parameters to return the desired book. Loads it into the web
# browser.
# To use add "?index=<1-7>" after "/obj_draw"

# index simply represents desired image. 1 to 7 are for the test images when
# attempting to return from the local instance.

@vision_test.route('/obj_draw', methods=["GET"])
def draw_obj():
    # Needs a user inputted paramater.
    index = int(request.args.get("index"))

    # Failsafe. If out of bounds.
    if index > 7 or index < 1:
        index = 5

    # Grabs the image path of the original file based on the parameter.
    image_path = ""
    match index:
        case 1:
            image_path = "vision/example_shelves/shelf_1.jpg"
        case 2:
            image_path = "vision/example_shelves/shelf_2.jpg"
        case 3:
            image_path = "vision/example_shelves/shelf_3.jpg"
        case 4:
            image_path = "vision/example_shelves/shelf_4.jpg"
        case 5:
            image_path = "vision/example_shelves/shelf_5.jpg"
        case 6:
            image_path = "vision/example_shelves/shelf_6.jpg"
        case 7:
            image_path = "vision/example_shelves/shelf_7.jpg"
        case _:
            image_path = "vision/example_shelves/shelf_5.jpg"

    # List to hold all found objects from google vision.
    shelf_img = []

    # Checks if the localize_objects function has been called in this session.
    if not bool(shelf.result):
        # No local images. Retrieve the test outputs.
        with open("vision/example_shelves/shelf_output", 'r') as json_file:
            pre_gen = json.load(json_file)

        # Only sample 4 has any results.
        shelf_img = pre_gen["shelf " + str(index)]
    else:
        # Local api call found. Retrieving info.
        shelf_img = shelf.result["shelf " + str(index)]

    # Loads the image.
    with open(image_path, "rb") as image_file:
        back_pic = Image.open(image_file)
        back_pic.load()

    # Create an ImageDraw object
    draw = ImageDraw.Draw(back_pic)

    # Loops for number of objects detected and draws a box around each
    # of them. The color is random.
    for i in range(len(shelf_img)):
        # Random color generator.
        r = random.randint(bot_lim, upp_lim)
        g = random.randint(bot_lim, upp_lim)
        b = random.randint(bot_lim, upp_lim)

        # Converts the vertices into coordinates and places them into a list.
        poly_xy = []
        for key in shelf_img[i]["bounds"].keys():
            poly_xy.append(shelf_img[i]["bounds"][key]['x'] * back_pic.width)
            poly_xy.append(shelf_img[i]["bounds"][key]['y'] * back_pic.height)

        # Draw the rectangle with a colored border and a width of 25 pixels
        draw.polygon(poly_xy, outline=(r, g, b), width=5)

        # Add text label to rectangle to display what google thinks this is
        # and how confident they are in that guess.
        text_coords = ((poly_xy[0] + poly_xy[4]) / 2, poly_xy[1] - 50)
        fnt = ImageFont.truetype("arial.ttf", 50)
        draw.text(text_coords, shelf_img[i]["name"] + "\n" +
                  str(shelf_img[i]["confidence"]), font=fnt,
                  fill=(r, g, b), anchor='mm', align='center')

    # Creates buffer object and saves the drawing to it.
    buffer = BytesIO()
    draw._image.save(buffer, 'JPEG')
    buffer.seek(0)  # Reset the buffer pointer to the beginning

    # Makes buffer objects into an output.
    response = send_file(buffer, mimetype='image/jpeg', as_attachment=False)

    # Returns drawn image.
    return response, HTTPStatus.OK


# Uses query parameters to return the desired book. Loads it into the web
# browser.
# To use add "?index=<1-10>"
# after "/ocr_draw".

# index simply represents desired image. First 3 (so 1-3) represent the
# back covers and last 7 (or 4-10) are the front covers.

@vision_test.route('/ocr_draw', methods=["GET"])
def draw_ocr():
    # Needs a user inputted paramater.
    index = int(request.args.get("index"))

    # Failsafe. If out of bounds.
    if index > 10 or index < 1:
        index = 4

    # Grabs the image path of the original file based on the parameter.
    image_path = ""
    match index:
        case 1:
            image_path = "vision/example_covers/back_1.jpg"
        case 2:
            image_path = "vision/example_covers/back_2.jpg"
        case 3:
            image_path = "vision/example_covers/back_3.jpg"
        case 4:
            image_path = "vision/example_covers/front_1.jpg"
        case 5:
            image_path = "vision/example_covers/front_2.jpg"
        case 6:
            image_path = "vision/example_covers/front_3.jpg"
        case 7:
            image_path = "vision/example_covers/front_4.jpg"
        case 8:
            image_path = "vision/example_covers/front_5.jpg"
        case 9:
            image_path = "vision/example_covers/front_6.jpg"
        case 10:
            image_path = "vision/example_covers/front_7.jpg"
        case _:
            image_path = "vision/example_covers/front_1.jpg"

    # List to hold all found objects from google vision.
    cov_img = []

    # Checks if the localize_objects function has been called in this session.
    if not bool(book.texts):
        # No local images. Retrieve the test outputs.
        with open("vision/example_covers/test_output", 'r') as json_file:
            pre_gen = json.load(json_file)

        # Load the pregenerated test output
        if index > 3:
            cov_img = pre_gen["front " + str(index - 3)]
        else:
            cov_img = pre_gen["back " + str(index)]
    else:
        # Local api call found. Retrieving info.
        if index > 3:
            cov_img = book.texts["front " + str(index - 3)]
        else:
            cov_img = book.texts["back " + str(index)]

    # Loads the image.
    with open(image_path, "rb") as image_file:
        pillow_image = Image.open(image_file)
        pillow_image.load()

    # Create an ImageDraw object
    draw = ImageDraw.Draw(pillow_image)

    # Loops for number of text objects detected and draws a box around each
    # of them. The color is random.
    for i in range(len(cov_img)):
        # Random color generator.
        r = random.randint(bot_lim, upp_lim)
        g = random.randint(bot_lim, upp_lim)
        b = random.randint(bot_lim, upp_lim)

        # Translates the bounds of each text box into integers.
        str_xy = cov_img[i]["bounds"].translate(str.maketrans(",", " ", "()"))
        int_xy = list(map(int, str_xy.split()))

        # Draw the rectangle with a colored border and a width of 5 pixels
        draw.polygon(int_xy, outline=(r, g, b), width=5)

        # Add text to rectangle to display what google thinks this is.
        text_coords = ((int_xy[0] + int_xy[4]) / 2, (int_xy[1] + int_xy[5]) / 2)
        fnt = ImageFont.truetype("arial.ttf", 25)
        draw.text(text_coords, cov_img[i]["text"], font=fnt, fill=(r, g, b),
                  anchor='mm', align='center')

    # Creates buffer object and saves the drawing to it.
    buffer = BytesIO()
    draw._image.save(buffer, 'JPEG')
    buffer.seek(0)  # Reset the buffer pointer to the beginning

    # Makes buffer objects into an output.
    response = send_file(buffer, mimetype='image/jpeg', as_attachment=False)

    # Returns drawn image.
    return response, HTTPStatus.OK
