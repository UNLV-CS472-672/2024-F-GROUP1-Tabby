from flask import Flask, request
from http import HTTPStatus

# from services import resource_format  # Use when actually running the server
from .services import resource_format  # Use when running pytest
from .api import books

# import test_routes

# --- IF USING PYTEST VS PYTHON ---
# You only need to modify this file! I've changed it around so only this
# breaks pytest or python! No need to modfy additional files beyond!

app = Flask(__name__)

app.register_blueprint(books.subapp, url_prefix="/books")


# @app.route('/testpage', methods=['GET'])
# app.add_url_rule('/testpage', view_func=alternate_page.test_page)
# @app.route('/test/make_request', methods=['GET'])
app.add_url_rule(
    "/test/make_request", view_func=resource_format.google_books_test_call_api
)
# @app.route('/test/all_books', methods=['GET'])
app.add_url_rule(
    "/test/all_books", view_func=resource_format.google_books_test_all_books
)


# Only need to swap here. Don't swap it in other files!
# Issue seems to be with how pytest functions. This will need looking into.
#   https://stackoverflow.com/questions/25827160/importing-correctly-with-pytest
#   https://stackoverflow.com/questions/43728431/relative-imports-modulenotfounderror-no-module-named-x
#   https://stackoverflow.com/questions/2349991/how-do-i-import-other-python-files
#   https://stackoverflow.com/questions/50190485/flask-importerror-cannot-import-name-app


# I've swapped over to using Lazy Loading rather than apps as packages.
# This fixes SOME of the issues regarding pytest and python.
# https://flask.palletsprojects.com/en/2.3.x/patterns/lazyloading/


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
