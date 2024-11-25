from flask import Flask
from http import HTTPStatus
from tabby_server.api import books
from .vision import yolo_test

"""
This is the central file of our app. Everything is called from here.

Blueprints will lead to other files and packages so they can be accessed.

The functions here are merely tests and should not actually be used.
"""

# Blueprints documentation
# https://flask.palletsprojects.com/en/stable/blueprints/


def create_app_instance(name: str = "Tabby_Server"):
    return (Flask(name))


app = create_app_instance()

# Test Python Files.
# OCR or Text Recognition
app.register_blueprint(books.subapp, url_prefix="/books")

# You Only Look Once (YOLO) Implementation - 1 Routable Function (shelf_read)
app.register_blueprint(yolo_test.yolo_test, url_prefix="/yolo")


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
