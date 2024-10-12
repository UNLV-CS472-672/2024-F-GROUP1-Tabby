from flask import Flask
from http import HTTPStatus

app = Flask(__name__)


# These import the extended python files.

import test_routes
from services import resource_format
from services import gcloud_api_generation


# Members API route
@app.route("/members", methods = ['GET'])
def members():
    return {"members" : ["Member1", "Member2", "Member3"]}, HTTPStatus.OK

@app.route("/api/test", methods = ['POST'])
def test():
    return {}, HTTPStatus.OK

if __name__ == "__main__":
    app.run(debug = True)

# Run by using 
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
