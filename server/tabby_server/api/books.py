from dataclasses import asdict
from functools import cache
from io import BytesIO
import logging
from pprint import pprint
from PIL import Image
import PIL
from flask import Blueprint, request
from http import HTTPStatus
import cv2 as cv
from cv2.typing import MatLike
import numpy as np
import torch
from tabby_server.services import google_books
from ..vision import ocr
from ..vision import extraction
from ..vision import image_labelling

_SCAN_SHELF_MAX_RESULTS_PER_BOOK = 5
"""Maximum results for each book when scanning shelf"""

subapp = Blueprint(name="books", import_name=__name__)


@subapp.route("/scan_cover", methods=["POST"])
def books_scan_cover():
    """Receives an image and returns a list of possible books that the image
    could represent.

    Expected fields in JSON:
    - `"image"`: Base64 data representing the image.
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

    logging.info("got to scan cover")

    books = scan_cover(img_mat)
    logging.info("after scan cover")

    # Filter out books without ISBNs
    books = [b for b in books if b.isbn]

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK


def scan_cover(image: MatLike) -> list[google_books.Book]:
    """Takes in an image of a cover and returns a list of results.

    Args:
        image: Image to scan.
    Returns:
        List of book information scanned. Empty if there is a failure at any
        part.
    """

    # Find text
    text_recognizer = get_text_recognizer()
    recognized_texts = text_recognizer.find_text(image)

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
        resultsCount: Number of results in 'result'.
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

    # Wrap it up in another dictionary and send!
    result = _get_result_dict(books)
    return result, HTTPStatus.OK


def _get_result_dict(books: list[google_books.Book]) -> dict:
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


@subapp.route('/scan_shelf', methods=['POST'])
def books_scan_shelf() -> tuple[dict, HTTPStatus]:

    # Load image
    logging.info("scanning image")
    try:
        img = Image.open(BytesIO(request.data))
    except PIL.UnidentifiedImageError:
        return {
            "message": "Couldn't read an image from the given body."
        }, HTTPStatus.BAD_REQUEST

    img = img.convert('RGB')
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
        books = [b for b in books if b.isbn]
        books = books[:_SCAN_SHELF_MAX_RESULTS_PER_BOOK]
        if len(books) >= 1:  # if not empty, append it
            new_shelf.append(books)

    # Convert into JSON
    results = []
    for books in new_shelf:
        result = _get_result_dict(books)
        results.append(result)
    
    return {
        'message': f'Scanned {len(results)} results',
        'results': results
    }, HTTPStatus.OK


def scan_shelf(image: MatLike) -> list[list[google_books.Book]]:
    """Takes in an image of a shelf and returns a list of list of results.

    Args:
        image: Image to scan.
    Returns:
        List of lists of book information scanned. Each sublist corresponds to a subimage. Empty
        if there is a failure at any part.
    """

    w, h, _ = image.shape

    image_processed = cv.resize(image, (640, 640))
    image_processed = image_processed / 255.0
    image_tensor = torch.from_numpy(image_processed).float().permute(2, 0, 1).unsqueeze(0)

    # Get subimages
    subimages = []
    segmentation_results = image_labelling.find_books(image_tensor)
    for sr in segmentation_results:

        # scale results to the original image
        x1 = int(sr['box']['x1'] / 640.0 * w)
        x2 = int(sr['box']['x2'] / 640.0 * w)
        y1 = int(sr['box']['y1'] / 640.0 * h)
        y2 = int(sr['box']['y2'] / 640.0 * h)
        
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

    # Scan each subimage
    shelf = []
    for subimage in subimages:
        books = scan_cover(subimage)
        shelf.append(books)

    return shelf
