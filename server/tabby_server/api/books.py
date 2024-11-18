from functools import cache
from flask import Blueprint, request
from http import HTTPStatus
from cv2.typing import MatLike
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
def books_search():
    """Receives a query representing a title and returns a list of possible
    books that could match.

    Expected query parameters:
    - `"title"`: Title query from user.
    """

    title = request.args.get("title")
    if not title:
        return {
            "message": "Must specify 'title' as a non-empty query parameter."
        }, HTTPStatus.BAD_REQUEST

    return {"results": []}, HTTPStatus.OK  # TODO: remove placeholder
