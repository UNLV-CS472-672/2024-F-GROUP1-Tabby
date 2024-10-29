import logging
import pytest
from tabby_server.services.resource_format import result_dict as r_d
from http import HTTPStatus
from flask.testing import FlaskClient
import requests_mock

# import os
# from dotenv import load_dotenv
from tabby_server.__main__ import app


# load_dotenv()


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
        result = client.post("/api/test")

        assert result.status_code == HTTPStatus.OK

    def test_scan_cover(self, client: FlaskClient):
        """Tests endpoint /books/scan_cover"""

        response = client.post("/books/scan_cover")
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert "message" in response.json
        logging.info(response.json)

        response = client.post("/books/scan_cover", json={})
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert "message" in response.json
        logging.info(response.json)

        response = client.post(
            "/books/scan_cover", json={"image": "pixel data goes here"}
        )
        assert response.status_code == HTTPStatus.OK
        assert "results" in response.json
        logging.info(response.json)

    def test_search(self, client: FlaskClient):
        """Tests endpoint /books/search"""

        response = client.get("/books/search")
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert "message" in response.json
        logging.info(response.json)

        response = client.get("/books/search", json={})
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert "message" in response.json
        logging.info(response.json)

        response = client.get(
            "/books/search",
            json={"title": "All Quiet on the Western Front"},
        )
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert "message" in response.json
        logging.info(response.json)

        response = client.get(
            "/books/search",
            query_string={"title": "All Quiet on the Western Front"},
        )

        assert response.status_code == HTTPStatus.OK
        assert "results" in response.json
        logging.info(response.json)

    # Makes a call to Google Books API
    def test_google_books_test_call_api(self, client):

        # This holds some great insight.
        # If this method fails later on, use this.
        # https://stackoverflow.com/questions/15753390/how-can-i-mock-requests-and-the-response

        with requests_mock.Mocker() as m:
            # Call redirection
            # local_api = os.getenv("API_KEY")
            m.get(requests_mock.ANY, json={"books": [0, 1]})

            # First Call - Should pass. Just calls the Google APU.
            result = client.get("/test/make_request")

            # Should be a successful search.
            assert result.status_code == HTTPStatus.OK
            assert "books" in result.json

    # Returns a dict with a key for a list which itself holds
    # a dict for each book returned.
    def test_google_books_test_all_books(self, client):
        # First Call - Should fail. No books.
        result = client.get("/test/all_books")

        # No prior search was made. No data to return.
        assert result.status_code == HTTPStatus.BAD_REQUEST
        assert "empty" in result.json

        # Second Call - Should pass. List of books.
        # This time makes an API call prior.
        r_d.output_dict = {
            "items": [
                {"volumeInfo": {"industryIdentifiers": 1}},
                {"volumeInfo": {"industryIdentifiers": 2}},
            ]
        }
        result = client.get("/test/all_books")

        # Returns a json with book attributes.
        assert result.status_code == HTTPStatus.OK
        assert "books" in result.json
