from flask import Flask
from http import HTTPStatus

app = Flask(__name__)


# These import the extended python files.

#from tabby_server import test_routes


#from services import resource_format   # Use when actually running the server
from .services import resource_format   # Use when running pytest

# Need to also swap test_routes, test_api
# Issue seems to be with how pytest functions. This will need looking into.
#   https://stackoverflow.com/questions/25827160/importing-correctly-with-pytest
#   https://stackoverflow.com/questions/43728431/relative-imports-modulenotfounderror-no-module-named-x
#   https://stackoverflow.com/questions/2349991/how-do-i-import-other-python-files
#   https://stackoverflow.com/questions/50190485/flask-importerror-cannot-import-name-app

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
