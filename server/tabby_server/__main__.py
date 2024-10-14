from flask import Flask, request
from http import HTTPStatus
import logging

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

    return {"books": "This is a placeholder result."}, HTTPStatus.OK


@app.route("/books/search", methods=["GET"])
def books_search():
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

    return {"books": "This is a placeholder result."}, HTTPStatus.OK


if __name__ == "__main__":
    app.run(debug=True)

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
