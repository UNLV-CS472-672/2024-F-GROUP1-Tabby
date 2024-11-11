"""Script to recognize text then extract the title/author results
from it."""

import logging
from pprint import pprint
import time
import cyclopts as cy
import cv2 as cv
import sys
from tabby_server.vision.extraction import extract_from_recognized_texts
from tabby_server.vision.ocr import TextRecognizer


app = cy.App()


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
    /,
) -> None:
    """Given an image, recognizes the text on the image, then
    attempts to recognize the title and authors the image.

    The output is an object with 5 options, with the first option
    being the most likely (as thought by the LLM). In addition,
    the object also has an explanation of its results.

    Args:
        image_path: Path of the image to look at.
    """
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)

    image = cv.imread(str(image_path))

    print("Creating text recognizer...")

    start_time = time.time()
    recognizer = TextRecognizer()
    duration = time.time() - start_time

    print(f"({duration:6.2f}s) Done creating text recognizer.")

    # Find text using OCR
    start_time = time.time()
    recognized_texts = recognizer.find_text(image)
    duration = time.time() - start_time

    print(f"({duration:6.2f}s) Done finding text. Results:")
    pprint(recognized_texts)

    # Extract title and author
    start_time = time.time()
    result = extract_from_recognized_texts(recognized_texts)
    duration = time.time() - start_time

    print(f"({duration:6.2f}s) Done extracting data. Results:")
    pprint(result)


if __name__ == "__main__":
    app()
