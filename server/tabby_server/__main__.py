from flask import Flask
from http import HTTPStatus

# from services.resource_format import books_test   # --- Use with python ---
from .services.resource_format import books_test  # /-/ Use with pytest /-/

# from vision.yolo_test import yolo_test            # --- Use with python ---
from .vision.yolo_test import yolo_test  # /-/ Use with pytest /-/
from .api import books

# You only need to modify this file! I've changed it around so only this
# breaks pytest or python! No need to modfy additional files beyond!
# --- IF USING PYTEST OR PYTHON ---

app = Flask(__name__)

app.register_blueprint(yolo_test, url_prefix="/yolo")
app.register_blueprint(books_test, url_prefix="/test")
app.register_blueprint(books.subapp, url_prefix="/books")


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
