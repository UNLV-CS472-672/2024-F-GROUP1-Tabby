import logging
import pathlib
from pprint import pprint
import sys
import cyclopts as cy
from PIL import Image
import cv2 as cv
import numpy as np

from tabby_server.api.books import scan_shelf


app = cy.App()

@app.default
def main(image_path: cy.types.ResolvedExistingFile) -> None:
    """Scans an image of a shelf, finds all the books, and for each book,
    extracts the title and author, searches using Google Books. At
    the end, show the results.
    
    Args:
        image_path: Path to the image to scan.
    """

    logging.basicConfig(filename='logs/scan_shelf.log', level=logging.INFO)

    image = cv.imread(str(image_path))
    results = scan_shelf(image)
    pprint(results)

    pprint([len(result) for result in results])


if __name__ == '__main__':
    app()
