from tabby_server import app
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
        result = client.get("/yolo/shelf_read")

        # This should always return true.
        assert result.status_code == HTTPStatus.OK
        assert result.json is not None and "shelf_1" in result.json

    def test_google_books_testing(self, client):
        """
        Should mock a call to Google Books API and act as if it was a real
        call.
        Should return a json of book attributes.
        Makes use of flower_of_algernon_test_40_output.json as test output.

        Does call get_google_books_query and attr_collecter.
        """

        # Load example output.
        # This was a json output from testing.
        with open("tests/flower_of_algernon_test_40_output.json", "r") as f:
            test_output = json.load(f)

        # Setup Mocker
        # Intercepts all Request Calls.
        with requests_mock.Mocker() as m:
            # Intercept an request message and make it always return the
            # example json.
            m.get(requests_mock.ANY, json={"book": "bad"})

            # -- Make Call to Function Using App Route --
            # No Arguments Given.
            # This should fail.
            result = client.get("/library/search/")
            assert result.json is not None and "badArgs" in result.json
            assert result.status_code == HTTPStatus.BAD_REQUEST

            # Bad Arguments Given. We have a format we need to follow!
            # This should fail.
            result = client.get(
                "/library/search/", query_string={"notIncluded": "nonexistent"}
            )
            assert result.json is not None and "badArgs" in result.json
            assert result.status_code == HTTPStatus.BAD_REQUEST

            # Correct Arguments, but No Results
            # The values here don't matter so long as the argument key is
            # valid. This should pass but we have it see nothing at right now.
            result = client.get(
                "/library/search/", query_string={"author": "nonexistent"}
            )
            assert result.json is not None and "matchless" in result.json
            assert result.status_code == HTTPStatus.OK

            # Intercepted request messages now return a single blank book.
            # This is to test if we somehow found books, but none have a
            # valid ISBN 13 id.
            m.get(
                requests_mock.ANY,
                json={
                    "items": [
                        {
                            "industryIdentifiers": [
                                {"identifier": "123", "type": "bad"},
                                {"identifier": "456", "type": "bad"},
                            ]
                        },
                        {
                            "industryIdentifiers": [
                                {"identifier": "123", "type": "bad"},
                                {"identifier": "456", "type": "bad"},
                            ]
                        },
                    ]
                },
            )

            # Matches Found, but None Valid.
            # Theoretically possible for us to get books in a return but
            # none of them have an ISBN 13.
            result = client.get(
                "/library/search/", query_string={"author": "who cares"}
            )
            assert result.json is not None and "error" in result.json
            assert result.status_code == HTTPStatus.OK

            # Intercept an request message and make it always return the
            # example json.
            # Now all requests will return that full json we have.
            m.get(requests_mock.ANY, json=test_output)

            # Flowers of Algernon Request.
            # Again, our values don't actually matter but this is what was
            # used to get our example anyways.
            result = client.get(
                "/library/search/",
                query_string={"phrase": "flowers", "author": "keyes"},
            )
            # The return is actually a json string. So we convert it into
            # a dict object to work with instead.
            # This will have all attributes from the Book() dataclass.
            assert result.status_code == HTTPStatus.OK
            result = json.loads(result.get_data(as_text=True))
            assert (
                result is not None
                and "isbn" in result
                and "title" in result
                and "authors" in result
                and "rating" in result
                and "excerpt" in result
                and "summary" in result
                and "thumbnail" in result
                and "page_count" in result
                and "genres" in result
                and "publisher" in result
                and "published_date" in result
            )
