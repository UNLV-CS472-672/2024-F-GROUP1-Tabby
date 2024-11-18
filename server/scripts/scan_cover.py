import logging
import sys
from typing import Annotated
import cv2 as cv
import cyclopts as cy
from pprint import pprint

from tabby_server.api.books import scan_cover


app = cy.App()


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
) -> None:
    """Scans the cover of the given book, extracts the title and author,
    searches using Google Books, and displays the results."""
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)

    image = cv.imread(str(image_path))
    books = scan_cover(image)
    pprint(books)


if __name__ == "__main__":
    app()
