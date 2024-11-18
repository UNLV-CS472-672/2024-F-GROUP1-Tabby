import requests_mock
from tabby_server.__main__ import app
from flask.testing import FlaskClient
from http import HTTPStatus
import logging
import pytest


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

        # No phrase parameter -> fail
        response = client.get("/books/search")
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # No phrase parameter despite JSON body -> fail
        response = client.get("/books/search", json={})
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Phrase in body but not as query parameter -> fail
        response = client.get(
            "/books/search",
            json={"phrase": "All Quiet on the Western Front"},
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Phrase in query -> success
        with requests_mock.Mocker() as m:

            google_books_url = "https://www.googleapis.com/books/v1/volumes"

            # Successful, but no results
            m.get(google_books_url, json={"totalItems": 0})
            response = client.get(
                "/books/search",
                query_string={"phrase": "All Quiet on the Western Front"},
            )
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert (
                response.json is not None and "resultsCount" in response.json
            )
            assert response.json["resultsCount"] == 0

            # No results because bad response
            m.get(google_books_url, status_code=500)
            response = client.get(
                "/books/search",
                query_string={"phrase": "All Quiet on the Western Front"},
            )
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert (
                response.json is not None and "resultsCount" in response.json
            )
            assert response.json["resultsCount"] == 0

            # Success, 2 results
            items = [
                {
                    "volumeInfo": {
                        "title": "APPLES",
                        "industryIdentifiers": [
                            {"identifier": "123", "type": "bad"},
                            {"identifier": "456", "type": "bad"},
                        ],
                    }
                },
                {
                    "volumeInfo": {
                        "title": "BANANAS",
                        "industryIdentifiers": [
                            {"identifier": "123", "type": "bad"},
                            {"identifier": "456", "type": "bad"},
                        ],
                    }
                },
            ]
            m.get(
                google_books_url,
                json={"items": items, "totalItems": len(items)},
            )
            response = client.get(
                "/books/search",
                query_string={"phrase": "All Quiet on the Western Front"},
            )
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert (
                response.json is not None and "resultsCount" in response.json
            )
            assert response.json["resultsCount"] == 2
            assert response.json["results"][0]["title"] == "APPLES"
            assert response.json["results"][1]["title"] == "BANANAS"

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
