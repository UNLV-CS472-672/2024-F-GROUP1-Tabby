from collections.abc import Mapping
from dataclasses import asdict
from functools import cache
from typing import Any
from flask import Blueprint, Response, request
from http import HTTPStatus
from cv2.typing import MatLike
from tabby_server.services import google_books
from ..vision import ocr
from ..vision import extraction


subapp = Blueprint(name="books", import_name=__name__)


@subapp.route("/scan_cover", methods=["POST"])
def books_scan_cover():
    """Receives an image and returns a list of possible books that the image
    could represent.

    Expected fields in JSON:
    - `"image"`: Base64 data representing the image.
    """

    if not request.is_json:
        return {
            "message": "Content type must be JSON."
        }, HTTPStatus.BAD_REQUEST
    data = request.get_json()

    image = data.get("image")
    if not image:
        return {
            "message": "Must specify 'image' as a non-empty string in body."
        }, HTTPStatus.BAD_REQUEST

    return {"results": []}, HTTPStatus.OK


def scan_cover(image: MatLike) -> list:
    """Takes in an image of a cover and returns a list of results.

    Args:
        image: Image to scan.
    Returns:
        List of book information to scan. Empty if there is a failure at any
        part.
    """

    # Find text
    text_recognizer = _get_text_recognizer()
    recognized_texts = text_recognizer.find_text(image)

    # Extract Title and Author
    extraction_result = extraction.extract_from_recognized_texts(
        recognized_texts
    )
    if extraction_result is None:
        return []

    return []


@cache
def _get_text_recognizer() -> ocr.TextRecognizer:
    return ocr.TextRecognizer()


@subapp.route("/search", methods=["GET"])
def books_search() -> tuple[dict, HTTPStatus]:
    """Receives a query for a search and returns a list of books.

    Required args:
        phrase: Phrase to search with. Think of this as the Search Bar in
            Google.

    Optional args:
        title:     Title to search for.
        author:    Author to search for.
        publisher: Publisher to search for.
        subject:   Subject to search for.
        isbn:      ISBN to search for.

    Responds with a JSON object with guaranteed three fields:
        message: Message for the result.
        results: Array of books found.
        resultCount: Number of results in 'result'.
    """

    # Check required arg
    phrase = request.args.get("phrase")
    if not phrase:
        return {
            "message": "Must specify 'phrase' as a non-empty query parameter."
        }, HTTPStatus.BAD_REQUEST

    # Extract optional args
    title = request.args.get("title", "")
    author = request.args.get("author", "")
    publisher = request.args.get("publisher", "")
    subject = request.args.get("subject", "")
    isbn = request.args.get("isbn", "")

    # Make the request
    books = google_books.request_volumes_get(
        phrase=phrase,
        title=title,
        author=author,
        publisher=publisher,
        subject=subject,
        isbn=isbn,
    )

    # Filter out books without ISBNs
    books = [b for b in books if b.isbn]

    # If no books, note that in the message
    if len(books) <= 0:
        result = {
            "message": "No books found.",
            "results": [],
            "resultsCount": 0,
        }
        return result, HTTPStatus.OK

    # Convert to dictionaries to put in the JSON
    results_count = len(books)
    book_dicts = [asdict(b) for b in books]

    # Wrap it up in another dictionary and send!
    result = {
        "message": f"Found {results_count} books.",
        "results": book_dicts,
        "resultsCount": results_count,
    }

    return result, HTTPStatus.OK
