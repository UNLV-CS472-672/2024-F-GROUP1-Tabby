import os
from http import HTTPStatus
from google.cloud import vision

# To my understanding, you do not need Google Cloud CLI.
# But just in case, here is the installation link.
# https://cloud.google.com/sdk/docs/install

# Documentation
#   https://cloud.google.com/vision/docs
#   https://cloud.google.com/vision/docs/features-list

# https://cloud.google.com/vision/docs/setup
# https://cloud.google.com/vision/docs/ocr
# https://cloud.google.com/vision/docs/detect-labels-image-api
# https://cloud.google.com/vision/docs/detect-labels-image-client-libraries#local-shell
# https://cloud.google.com/vision/docs/libraries

# Example Video
# https://youtu.be/hkKKfEqZvn4


# Necessary to authenticate to our project.
# This is a different API key than Google Books
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""
# Change "vision/vision_key.json" to be whatever path is to your service key token json


# This is the given function from the google website on how to implement
# Optical Character Recognition (OCR) into the project.

# https://cloud.google.com/vision/docs/ocr

def detect_text(path):
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
            f"({vertex.x},{vertex.y})" for vertex in text.bounding_poly.vertices
        ]
        ocr_text["bounds"] = format(",".join(vertices))
        
        # Appends it to the end of the list to be returned.
        ocr_result.append(ocr_text)

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(response.error.message)
        )
    
    # Returns the list
    return ocr_result


# Class to hold data
class books_sides:
    covers = []
    shells = []
    texts = {}

book = books_sides()

# Add books to be checked
book.covers.append("vision/example_covers/chamber-of-secrets-us-childrens-edition-1050x0-c-default.jpg")
book.covers.append("vision/example_covers/deathly-hallows-ebook-cover-1050x0-c-default.jpg")
book.covers.append("vision/example_covers/goblet-of-fire-uk-childrens-edition-2014.jpg")
book.covers.append("vision/example_covers/half-blood-prince-adult-edition.jpg")
book.covers.append("vision/example_covers/order-of-the-phoenix-us-childrens-edition-1050x0-c-default.jpg")
book.covers.append("vision/example_covers/prisoner-of-azkaban-uk-childrens-edition-1050x0-c-default.jpg")
book.covers.append("vision/example_covers/sorcerers-stone-school-market-edition.jpg")
book.shells.append("vision/example_covers/Lightlark-BACK-resized.jpg")
book.shells.append("vision/example_covers/The-New-Couple-BACK-resized.jpg")
book.shells.append("vision/example_covers/None-of-This-Is-True-BACK-resized.jpg")



# Calls the above function for a check of each book and returns the results.
# For each book above, a unique api call is given.
# Be wary, we only have 1000 per month total.

# This output is in a text file in /vision

def google_vision_ocr_test():
    # Only calls if nothing has been returned
    if not bool(book.texts):
        
        # Loops through front covers.
        i = 0
        for front in range(len(book.covers)):
            book.texts["front " + str(i)] = detect_text(book.covers[front])
            i = i + 1

        # Loops through back covers.
        i = 0
        for back in range(len(book.shells)):
            book.texts["back " + str(i)] = detect_text(book.shells[back])
            i = i + 1
        
    # Returns the complete output of the API call.
    return book.texts, HTTPStatus.OK
