import atexit
import logging
from pathlib import Path
from pprint import pprint
import cyclopts as cy
from cyclopts.types import ResolvedFile

from tabby_server.services import google_books


app = cy.App()


@app.default
def main(
    phrase: str = "",
    *,
    title: str = "",
    author: str = "",
    publisher: str = "",
    subject: str = "",
    isbn: str = "",
    logging_file: ResolvedFile = Path("logs/google_book.log")
) -> None:
    """Searches for a book and prints the results

    Args:
        phrase:       Phrase parameter. Most Important. Searches everything.
        intitle:      Title parameter.
        inauthor:     Author parameter.
        inpublisher:  Publisher parameter.
        subject:      Subject parameter.
        isbn:         ISBN parameter.
        logging_file: File to log info.
    """
    if not (phrase or title or author or publisher or subject or isbn):
        print("Please enter at least one search term.")
        return

    # Configure logging
    f = open(str(logging_file), "w")
    atexit.register(f.close)  # Close on program exit
    logging.basicConfig(stream=f, level=logging.INFO)

    # Make request and get results
    result = google_books.request_volumes_get(phrase=phrase)
    pprint(result)


if __name__ == "__main__":
    app()
