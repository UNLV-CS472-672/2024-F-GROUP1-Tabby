from collections.abc import Generator
from contextlib import contextmanager
from dataclasses import asdict
from functools import cache
from io import BytesIO
import logging
import os
import re
import time
from typing import Literal
from PIL import Image
import PIL
from dotenv import load_dotenv
from flask import Blueprint, request, current_app
from http import HTTPStatus
import cv2 as cv
from cv2.typing import MatLike
import numpy as np
import torch
from tabby_server.services import google_books
from tabby_server.services import tags
from ..vision import ocr
from ..vision import extraction
from ..vision import image_labelling


load_dotenv()

_SCAN_SHELF_MAX_RESULTS_PER_BOOK = 5
"""Maximum results for each book when scanning shelf"""

_FILTER_ISBN: bool = bool(int(os.getenv("FILTER_ISBN", "1")))
"""True if books without ISBN should be filtered out, false otherwise."""

subapp = Blueprint(name="books", import_name=__name__)

G = "\u001b[32m"
B = "\u001b[34m"
RESET = "\033[0m"

_OCR_CONFIDENCE_MIN: float = 0.3


@contextmanager
def logging_duration(message: str) -> Generator[None, None, None]:
    """Context manager in which the total time the code took is logged at
    exit."""
    start = time.time()
    logging.info(f"{G}START       {message}{RESET}")
    try:
        yield
    finally:
        duration = time.time() - start
        logging.info(f"{B}END {duration:6.2f}s {message}{RESET}")


@subapp.route("/scan_cover", methods=["POST"])
def books_scan_cover():
    """Receives an image and returns a list of possible books that the image
    could represent.

    The body of the request should be binary data (JPG or PNG) reprsenting
    the image.
    """

    current_app.logger.info(f"{G}START       /scan_shelf{RESET}")

    # Try scan image
    with logging_duration("Read image"):
        try:
            img = Image.open(BytesIO(request.data))
        except PIL.UnidentifiedImageError:
            return {
                "message": "Couldn't read an image from the given body."
            }, HTTPStatus.BAD_REQUEST
        img = img.convert("RGB")

    # ai-gen start (ChatGPT-4o, 2)
    img_mat = np.array(img)
    img_mat = cv.cvtColor(img_mat, cv.COLOR_RGB2BGR)
    # ai-gen end

    # Scan cover
    books = scan_cover(img_mat)

    # Filter out books without ISBNs
    if _FILTER_ISBN:
        books = [b for b in books if b.isbn]

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK


def scan_cover(
    image_matrix: MatLike, angles: tuple[Literal[0, 90, 180, 270], ...] = (0,)
) -> list[google_books.Book]:
    """Takes in an image of a cover and returns a list of results.

    Args:
        image_matrix: Image to scan.
    Returns:
        List of book information scanned. Empty if there is a failure at any
        part.
    """

    # Find text
    recognized_texts: list[ocr.RecognizedText] = []
    for angle in angles:
        with logging_duration(f"Recognize text using OCR ({angle} deg)"):
            text_recognizer = get_text_recognizer()
            recognized_texts += text_recognizer.find_text(image_matrix, angle)

    # Filter out bad text
    recognized_texts = [
        r
        for r in recognized_texts
        if r.confidence >= _OCR_CONFIDENCE_MIN and len(r.text) >= 2
    ]

    # Log text
    if recognized_texts:
        logging.info("Found text:")
        for r in recognized_texts:
            logging.info(f"  ({r.confidence * 100:5.2f}%) {r.text}")
    else:  # None found
        logging.info("Found NO text")
        return []

    # Extract Title and Author
    with logging_duration("Extract title and author using ChatGPT"):
        extraction_result = extraction.extract_from_recognized_texts(
            recognized_texts
        )
    if extraction_result is None:
        return []

    # Make the request to Google Books
    with logging_duration("Request info from Google Books"):
        top_option = extraction_result.options[0]

        title = remove_punctuation(top_option.title).lower()
        author = remove_punctuation(top_option.title).lower()

        books = google_books.request_volumes_get(f"{title} {author}")
        logging.info(f"Got {len(books)} from Google Books")

    return books


# ai-gen start (ChatGPT-4o, 0)
def remove_punctuation(text: str) -> str:
    """
    Removes all punctuation from the given text.

    Args:
        text (str): The input string from which punctuation will be removed.

    Returns:
        str: The text without any punctuation.
    """
    return re.sub(r"[^\w\s]", "", text)


# ai-gen end


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
    current_app.logger.info(f"{G}START       /search{RESET}")

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
    with logging_duration("Request info from Google Books"):
        books = google_books.request_volumes_get(
            phrase=phrase,
            title=title,
            author=author,
            publisher=publisher,
            subject=subject,
            isbn=isbn,
        )

    # Filter out books without ISBNs
    if _FILTER_ISBN:
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


@subapp.route("/scan_shelf", methods=["POST"])
def books_scan_shelf() -> tuple[dict, HTTPStatus]:
    """Scans a shelf. This gives a list of books that could be in the given
    image.

    The body of the request should be binary data (JPG or PNG) reprsenting
    the image.
    """
    current_app.logger.info(f"{G}START       /scan_shelf{RESET}")

    # Load image
    with logging_duration("Read image"):
        try:
            img_file = Image.open(BytesIO(request.data))
        except PIL.UnidentifiedImageError:
            return {
                "message": "Couldn't read an image from the given body."
            }, HTTPStatus.BAD_REQUEST

    img = img_file.convert("RGB")
    # ai-gen start (ChatGPT-4o, 2)
    img_mat = np.array(img)
    img_mat = cv.cvtColor(img_mat, cv.COLOR_RGB2BGR)
    # ai-gen end

    # scan shelf
    scanned_shelf = scan_shelf(img_mat)

    # filter out any books without ISBNs
    # and limit each sublist to a maximum number of books
    new_shelf = []
    for books in scanned_shelf:
        if _FILTER_ISBN:
            books = [b for b in books if b.isbn]
        books = books[:_SCAN_SHELF_MAX_RESULTS_PER_BOOK]
        if len(books) >= 1:  # if not empty, append it
            new_shelf.append(books)

    # Select first book in each row
    results = []
    for books in new_shelf:
        if len(books) >= 1:
            results.append(books[0])

    return _get_result_dict(results), HTTPStatus.OK


def scan_shelf(image: MatLike) -> list[list[google_books.Book]]:
    """Takes in an image of a shelf and returns a list of list of results.

    Args:
        image: Image to scan.
    Returns:
        List of lists of book information scanned. Each sublist corresponds to
        a subimage. Empty if there is a failure at any part.
    """

    w, h, _ = image.shape

    image_processed = cv.resize(image, (640, 640))
    image_processed = image_processed / 255.0
    image_tensor = (
        torch.from_numpy(image_processed).float().permute(2, 0, 1).unsqueeze(0)
    )

    # Get subimages
    subimages = []
    with logging_duration("Find books on shelf"):
        segmentation_results = image_labelling.find_books(image_tensor)
    for sr in segmentation_results:

        # scale results to the original image
        x1 = int(sr["box"]["x1"] / 640.0 * w)
        x2 = int(sr["box"]["x2"] / 640.0 * w)
        y1 = int(sr["box"]["y1"] / 640.0 * h)
        y2 = int(sr["box"]["y2"] / 640.0 * h)

        # ensure coords are in range
        x1 = min(max(x1, 0), w - 1)
        x2 = min(max(x2, 0), w - 1)
        y1 = min(max(y1, 0), h - 1)
        y2 = min(max(y2, 0), h - 1)

        # ensure x1 < x2 and y1 < y2
        x1, x2 = min(x1, x2), max(x1, x2)
        y1, y2 = min(y1, y2), max(y1, y2)

        subimage = image[y1:y2, x1:x2, :]
        if np.all(subimage.shape):  # if none of the dimensions are 0, add it
            subimages.append(subimage)

    logging.info(f"Found {len(subimages)} books in shelf image.")

    # Scan each subimage
    with logging_duration("Use OCR on each image."):
        shelf = []
        for subimage in subimages:
            books = scan_cover(subimage, angles=(0, 90, 270))
            shelf.append(books)

    return shelf


@subapp.route("/recommendations", methods=["POST"])
def books_recommendations() -> tuple[dict, HTTPStatus]:
    """Gets a list of recommendations for the given set of books.

    The request must contain a JSON body with the following parameters:
        titles: List with each element being the title of each book
        authors: List with each element being the author(s) of each book
        weights: List of numbers corresponding to how heavily weighed is each
            book. Each number is from 0 to 1.

    Each parameter must be of the same length.
    """
    current_app.logger.info(f"{G}START       /recommendations{RESET}")

    # Titles and authors are separated by |---| because they might contain
    # punctuation like commas, semicolons, etc.

    # Get parameters

    if request.json is None:
        return {
            "message": "Request body must be JSON."
        }, HTTPStatus.BAD_REQUEST

    json = request.json

    # Check if body is dict
    if not isinstance(json, dict):
        return {
            "message": "Request body must be a JSON object."
        }, HTTPStatus.BAD_REQUEST

    # Get titles
    titles = json.get("titles")
    if titles is None:
        return {
            "message": 'Body must have "title" parameter (array of strings)'
        }, HTTPStatus.BAD_REQUEST
    if not (
        isinstance(titles, list) and all(isinstance(s, str) for s in titles)
    ):
        return {
            "message": '"title" must be an array of strings'
        }, HTTPStatus.BAD_REQUEST

    # Get authors
    authors = json.get("authors")
    if authors is None:
        return {
            "message": 'Body must have "authors" parameter (array of strings)'
        }, HTTPStatus.BAD_REQUEST
    if not (
        isinstance(authors, list) and all(isinstance(s, str) for s in authors)
    ):
        return {
            "message": '"title" must be an array of strings'
        }, HTTPStatus.BAD_REQUEST

    # Get weights
    weights = json.get("weights")
    if weights is None:
        return {
            "message": 'Body must have "weights" parameter (array of numbers'
            "between 0 and 1)"
        }, HTTPStatus.BAD_REQUEST
    if not (
        isinstance(authors, list)
        and all(isinstance(w, (float, int)) for w in weights)
    ):
        return {
            "message": '"weights" must be an array of numbers'
        }, HTTPStatus.BAD_REQUEST

    # Make weights floats and clamp them
    for i, w in enumerate(weights):
        weights[i] = float(np.clip(w, 0.0, 1.0))

    # If not equal-length lists, then return error
    if not (len(titles) == len(authors) == len(weights)):
        return {
            "message": "All lists must be equal in length."
        }, HTTPStatus.BAD_REQUEST

    # Get tags
    with logging_duration("Get tags from ChatGPT"):
        tags_list = tags.get_tags(titles, authors, weights)
        if not tags_list:  # if empty, return error
            return {
                "message": "Unable to get tags from the given books."
            }, HTTPStatus.BAD_REQUEST
        logging.info("Tags list:")
        for tag in tags_list:
            logging.info(f"  {tag}")

    # Get related books using list of tags
    with logging_duration("Request from Google Books"):
        books = google_books.request_volumes_get(phrase=", ".join(tags_list))

    # Filter out books without ISBNs
    if _FILTER_ISBN:
        books = [b for b in books if b.isbn]

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK
