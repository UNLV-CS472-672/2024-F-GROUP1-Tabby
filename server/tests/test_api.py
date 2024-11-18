from tabby_server.__main__ import app
from flask.testing import FlaskClient
from http import HTTPStatus
import requests_mock
import logging
import pytest
import json


@pytest.fixture()
def client():
    return app.test_client()


@pytest.mark.usefixtures("client")
class TestAPIEndPoint:
    def test_first_funct(self, client):
        # Test Test
        result = client.get("/members")

        assert result.status_code == HTTPStatus.OK

    def test_test(self, client):
        response = client.post("/api/test")

        logging.info(response.json)
        assert response.json is not None and "message" in response.json
        assert response.status_code == HTTPStatus.OK

    def test_scan_cover(self, client: FlaskClient):
        """Tests endpoint /books/scan_cover"""

        response = client.post("/books/scan_cover")
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.post("/books/scan_cover", json={})
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.post(
            "/books/scan_cover", json={"image": "pixel data goes here"}
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.OK
        assert response.json is not None and "results" in response.json

    def test_search(self, client: FlaskClient):
        """Tests endpoint /books/search"""

        response = client.get("/books/search")
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get("/books/search", json={})
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            "/books/search",
            json={"title": "All Quiet on the Western Front"},
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            "/books/search",
            query_string={"title": "All Quiet on the Western Front"},
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.OK
        assert response.json is not None and "results" in response.json

    # Test call to YOLO object recognition. Uses a 0 as a parameter so data
    # is not saved from pytest call.
    def test_predict_examples(self, client):
        # Calls for the model to run object detection on example images.
        # Does not save the results.
        result = client.get("/yolo/shelf_read", query_string={"index": int(0)})

        # This should always return true.
        assert result.status_code == HTTPStatus.OK
        assert result.json is not None and "Detected" in result.json

        # Calls the model but provides an incorrect index
        result = client.get("/yolo/shelf_read", query_string={"index": int(2)})

        # This should always return false.
        assert result.status_code == HTTPStatus.BAD_REQUEST
        assert result.json is not None and "Incorrect" in result.json
