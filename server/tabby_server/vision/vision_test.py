from flask import Blueprint
import os
from http import HTTPStatus
from google.cloud import vision

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

    print(f"Number of objects found: {len(obj)}")
    for object_ in obj:
        print(f"\n{object_.name} (confidence: {object_.score})")
        print("Normalized bounding polygon vertices: ")

        # For each object found, it will save the name and confidence in a
        # dict. Along with the bounding vertices.
        obj_object = {}
        obj_object['name'] = object_.name
        obj_object['confidence'] = object_.score
        obj_object['bounds'] = {}

        i = 1
        for vertex in object_.bounding_poly.normalized_vertices:
            print(f" - ({vertex.x}, {vertex.y})")
            obj_object['bounds']["vertex_" + str(i)] = {'x': vertex.x, 'y': vertex.y}
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
        shelf.picts.append("vision/example_shelves/shelf_1.jpg")
        shelf.picts.append("vision/example_shelves/shelf_2.jpg")
        shelf.picts.append("vision/example_shelves/shelf_3.jpg")
        shelf.picts.append("vision/example_shelves/shelf_4.jpg")
        shelf.picts.append("vision/example_shelves/shelf_5.jpg")
        shelf.picts.append("vision/example_shelves/shelf_6.jpg")
        shelf.picts.append("vision/example_shelves/shelf_7.jpg")

        # Loops through images
        for i in range(len(shelf.picts)):
            shelf.result["shelf " + str(i)] = localize_objects(shelf.picts[i])

    # Returns the complete output of the API call.
    return shelf.result, HTTPStatus.OK
    # return shelf.picts, HTTPStatus.OK


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
        for front in range(len(book.covers)):
            book.texts["front " + str(front)] = detect_text(book.covers[front])

        # Loops through back covers.
        for back in range(len(book.shells)):
            book.texts["back " + str(back)] = detect_text(book.shells[back])

    # Returns the complete output of the API call.
    return book.texts, HTTPStatus.OK
