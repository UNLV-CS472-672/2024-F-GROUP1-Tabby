from flask import Flask
from http import HTTPStatus
from .services import library
from .vision import yolo_test
from .api import books

"""
This is the central file of our app. Everything is called from here.

Blueprints will lead to other files and packages so they can be accessed.

The functions here are merely tests and should not actually be used.
"""

app = Flask(__name__)

# Test Python Files.
# YOLO or Image Recognition
app.register_blueprint(yolo_test.yolo_test, url_prefix="/yolo")
# OCR or Text Recognition
app.register_blueprint(books.subapp, url_prefix="/books")

# Actual Python Files.
# Google Books Implementation - 1 Routable Function (search)
# http://localhost:5000/library/search/
app.register_blueprint(library.books_api, url_prefix="/library")


# Blueprints documentation
# https://flask.palletsprojects.com/en/stable/blueprints/


# Members API route
@app.route("/members", methods=["GET"])
def members():
    return {"members": ["Member1", "Member2", "Member3"]}, HTTPStatus.OK


@app.route("/api/test", methods=["POST"])
def test():
    return {"message": "Hello world!"}, HTTPStatus.OK


if __name__ == "__main__":
    app.run(debug=True)

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
