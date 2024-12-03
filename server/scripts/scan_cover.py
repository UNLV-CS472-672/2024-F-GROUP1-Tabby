import logging
import sys
import cv2 as cv
import cyclopts as cy

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
    books, _ = scan_cover(image)
    for book in books:
        print(f"{book.title}")
        print(f"- {book.authors}")


if __name__ == "__main__":
    app()
