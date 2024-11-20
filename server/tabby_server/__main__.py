import os
from http import HTTPStatus
from tabby_server.services import library
from tabby_server.api import books
from tabby_server import app

"""
This is the central file of our app. Everything is called from here.

Blueprints will lead to other files and packages so they can be accessed.

The functions here are merely tests and should not actually be used.
"""

PORT = os.getenv("PORT", "8000")

# Test Python Files.
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


@app.route("/")
def hello_world():
    return {"message": "Hello from Koyeb..."}, HTTPStatus.OK


@app.route("/api/test", methods=["POST"])
def test():
    return {"message": "Hello world!"}, HTTPStatus.OK


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=int(PORT))

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
