import logging
import pytest

from http import HTTPStatus
from tabby_server.__main__ import app
from flask.testing import FlaskClient


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
