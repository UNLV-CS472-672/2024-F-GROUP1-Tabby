from dataclasses import asdict
from functools import cache
from io import BytesIO
import logging
from PIL import Image
import PIL
from flask import Blueprint, request
from http import HTTPStatus
import cv2 as cv
from cv2.typing import MatLike
import numpy as np
from tabby_server.services import google_books
from tabby_server.services import tags
from ..vision import ocr
from ..vision import extraction


subapp = Blueprint(name="books", import_name=__name__)


@subapp.route("/scan_cover", methods=["POST"])
def books_scan_cover():
    """Receives an image and returns a list of possible books that the image
    could represent.

    The body of the request should be binary data (JPG or PNG) reprsenting
    the image.
    """

    logging.info("scanning image")

    # Try scan image
    try:
        img = Image.open(BytesIO(request.data))
    except PIL.UnidentifiedImageError:
        return {
            "message": "Couldn't read an image from the given body."
        }, HTTPStatus.BAD_REQUEST

    img = img.convert("RGB")

    logging.info("creating matrix")

    # ai-gen start (ChatGPT-4o, 2)
    img_mat = np.array(img)
    img_mat = cv.cvtColor(img_mat, cv.COLOR_RGB2BGR)
    # ai-gen end

    logging.info("scanning cover")

    books = scan_cover(img_mat)
    logging.info("filtering book results")

    # Filter out books without ISBNs
    books = [b for b in books if b.isbn]

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK


def scan_cover(image_matrix: MatLike) -> list[google_books.Book]:
    """Takes in an image of a cover and returns a list of results.

    Args:
        image_matrix: Image to scan.
    Returns:
        List of book information scanned. Empty if there is a failure at any
        part.
    """

    # Find text
    text_recognizer = get_text_recognizer()
    recognized_texts = text_recognizer.find_text(image_matrix)

    # Extract Title and Author
    extraction_result = extraction.extract_from_recognized_texts(
        recognized_texts
    )
    if extraction_result is None:
        return []

    # Make the request to Google Books
    top_option = extraction_result.options[0]
    books = google_books.request_volumes_get(
        phrase=top_option.title, author=top_option.author
    )

    return books


# Creates object on first call, then returns that same object
@cache
def get_text_recognizer() -> ocr.TextRecognizer:
    """Gets the text recognizer. Creates the object if it's not already
    created.

    Returns:
        Text recognizer object.
    """
    return ocr.TextRecognizer()


@subapp.route("/search", methods=["GET"])
def books_search() -> tuple[dict, HTTPStatus]:
    """Receives a query for a search and returns a list of books.

    The request must contain at least ONE of the parameters.

    Parameters:
        title:     Title to search for.
        author:    Author to search for.
        publisher: Publisher to search for.
        subject:   Subject to search for.
        isbn:      ISBN to search for.
        phrase: Phrase to search with. Think of this as the Search Bar in
            Google.

    Responds with a JSON object with guaranteed three fields:
        message: Message for the result.
        results: Array of books found.
        resultsCount: Number of results in 'result'.
    """

    # Extract optional args
    phrase = request.args.get("phrase", "")
    title = request.args.get("title", "")
    author = request.args.get("author", "")
    publisher = request.args.get("publisher", "")
    subject = request.args.get("subject", "")
    isbn = request.args.get("isbn", "")

    if not any([phrase, title, author, publisher, subject, isbn]):
        return {
            "message": "Request must contain at least one of the parameters, "
            "and that parameter must be non-empty."
        }, HTTPStatus.BAD_REQUEST

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

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK


def _get_result_dict(books: list[google_books.Book]) -> dict:
    """Creates a result dictionary for a set of books.

    Returns:
        Dictionary for a single book, containing three attributes:
            'message': Describes the status of the response.
            'results': List of books
            'resultsCount': How many results there are
    """
    results_count = len(books)
    if results_count <= 0:
        return {
            "message": "No books found.",
            "results": [],
            "resultsCount": 0,
        }
    book_dicts = [asdict(b) for b in books]
    return {
        "message": f"Found {results_count} books.",
        "results": book_dicts,
        "resultsCount": results_count,
    }


@subapp.route("/recommendations", methods=["GET"])
def books_recommendations() -> tuple[dict, HTTPStatus]:
    """Gets a list of recommendations for the given set of books.

    The request must contain parameters for two parallel lists.

    Required args:
        titles: List with each element being the title of each book, each
            separated by |---|
        authors: List with each element being the author(s) of each book, each
            separated by |---|
        weights: List of numbers corresponding to how heavily weighed is each
            book, separated by |---|. Each number is from 0 to 1.
    """

    # Titles and authors are separated by |---| because they might contain
    # punctuation like commas, semicolons, etc.

    # Check required args
    titles_str = request.args.get("titles")
    if not titles_str:
        return {
            "message": "Must specify 'titles' as a non-empty query parameter."
        }, HTTPStatus.BAD_REQUEST
    authors_str = request.args.get("authors")
    if not authors_str:
        return {
            "message": "Must specify 'authors' as a non-empty query parameter."
        }, HTTPStatus.BAD_REQUEST
    weights_str = request.args.get("weights")
    if not weights_str:
        return {
            "message": "Must specify 'weights' as a non-empty query parameter."
        }, HTTPStatus.BAD_REQUEST

    # Extract each title and author
    titles_list = [t.strip() for t in titles_str.split("|---|")]
    authors_list = [a.strip() for a in authors_str.split("|---|")]
    if any(t == "" for t in titles_list):
        return {
            "message": ("'titles' cannot have an empty element.")
        }, HTTPStatus.BAD_REQUEST
    if any(a == "" for a in authors_list):
        return {
            "message": ("'authors' cannot have an empty element.")
        }, HTTPStatus.BAD_REQUEST

    # Extract each weight
    weights_list = []
    for i, wstr in enumerate(weights_str.split("|---|")):
        wstr = wstr.strip()
        try:
            w = float(wstr)
            if not (0.0 <= w <= 1.0):
                return {
                    "message": (f"Element {i} at 'weights' is not in [0, 1].")
                }, HTTPStatus.BAD_REQUEST
            weights_list.append(w)
        except ValueError:
            return {
                "message": (f"Element {i} at 'weights' is not a number.")
            }, HTTPStatus.BAD_REQUEST

    # If not equal-length lists, then return error
    if not (len(titles_list) == len(authors_list) == len(weights_list)):
        return {
            "message": "All lists must be equal in length."
        }, HTTPStatus.BAD_REQUEST

    # Get tags
    tags_list = tags.get_tags(titles_list, authors_list, weights_list)
    if not tags_list:  # if empty, return error
        return {
            "message": "Unable to get tags from the given books."
        }, HTTPStatus.BAD_REQUEST

    # Get related books using list of tags
    books = google_books.request_volumes_get(phrase=", ".join(tags_list))

    # Filter out books without ISBNs
    books = [b for b in books if b.isbn]

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK
