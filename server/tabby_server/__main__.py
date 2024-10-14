from flask import Flask, request
from http import HTTPStatus

app = Flask(__name__)


# Members API route
@app.route("/members", methods=["GET"])
def members():
    return {"members": ["Member1", "Member2", "Member3"]}, HTTPStatus.OK


@app.route("/api/test", methods=["POST"])
def test():
    return {}, HTTPStatus.OK


@app.route("/books/scan_cover", methods=["GET"])
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


@app.route("/books/search", methods=["GET"])
def books_search():
    """Receives a query representing a title and returns a list of possible
    books that could match.

    Expected fields in JSON:
    - `"title"`: Title query from user.
    """

    if not request.is_json:
        return {
            "message": "Content type must be JSON."
        }, HTTPStatus.BAD_REQUEST
    data = request.get_json()

    title = data.get("title")
    if not title:
        return {
            "message": "Must specify 'title' as a non-empty string in body."
        }, HTTPStatus.BAD_REQUEST

    return {"results": []}, HTTPStatus.OK


if __name__ == "__main__":
    app.run(debug=True)

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
