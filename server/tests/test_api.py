from tabby_server.__main__ import app
from flask.testing import FlaskClient
from http import HTTPStatus
import requests_mock
import logging
import pytest
import json
from tabby_server.services.resource_format import result_dict as r_d


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
        assert result.json is not None and "empty" in result.json

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
        assert result.json is not None and "books" in result.json

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

    def test_google_books_search(self, client):
        """
        Should mock a call to Google Books API and act as if it was a real
        call.
        Should return a list of dataclasses of book attributes.
        Makes use of flower_of_algernon_test_40_output.json as test output.

        Does call query_assembler and attr_collecter.
        """

        # Load example output.
        with open("tests/flower_of_algernon_test_40_output.json", "r") as f:
            test_output = json.load(f)

        # Setup Mocker
        with requests_mock.Mocker() as m:
            # Intercept an request message and make it always return the
            # example json.
            m.get(requests_mock.ANY, json={"book": "bad"})

            # -- Make Call to Function Using App Route --
            # No Arguments
            result = client.get("/library/search/")
            assert result.json is not None and "badArgs" in result.json
            assert result.status_code == HTTPStatus.BAD_REQUEST

            # Bad Arguments
            result = client.get(
                "/library/search/", query_string={"notIncluded": "nonexistent"}
            )
            assert result.json is not None and "badArgs" in result.json
            assert result.status_code == HTTPStatus.BAD_REQUEST

            # Correct Arguments, but No Results
            result = client.get(
                "/library/search/", query_string={"author": "nonexistent"}
            )
            assert result.json is not None and "error" in result.json
            assert result.status_code == HTTPStatus.OK

            # Intercept an request message and make it always return the
            # example json.
            m.get(requests_mock.ANY, json=test_output)

            # Flowers of Algernon Request
            result = client.get(
                "/library/search/",
                query_string={"phrase": "flowers", "author": "keyes"},
            )
            assert (
                result.json is not None
                and "books" in result.json
                and "number" in result.json
            )
            assert result.status_code == HTTPStatus.OK


def test_parameter_handler():
    """
    Provides false parameters in a mock query.
    This should convert them into pre-determined format.
    """

    # Import Function
    from tabby_server.services.library import parameter_handler

    # Incomplete/Empty Arguments
    result = parameter_handler()
    assert result == ""
    result = parameter_handler("blank")
    assert result == "blank"
    result = parameter_handler(index=-1)
    assert result == ""

    # Title
    result = parameter_handler("title", 0)
    assert result == "+intitle:title"

    # Author
    result = parameter_handler("author", 1)
    assert result == "+inauthor:author"

    # Publisher
    result = parameter_handler("publisher", 2)
    assert result == "+inpublisher:publisher"

    # Subject
    result = parameter_handler("subject", 3)
    assert result == "+subject:subject"

    # ISBN
    result = parameter_handler("isbn", 4)
    assert result == "+isbn:isbn"

    # Default/Non Parameter
    result = parameter_handler("default", 5)
    assert result == "default"


def test_query_assembler():
    """
    Provides false parameters for a mock query.
    Should format the given parameters into a specific string.

    Does call parameter_handler.
    """

    # Import function
    from tabby_server.services.library import query_assembler

    # No Arguments
    result = query_assembler()
    assert result == ""

    # Single Arguments
    result = query_assembler(phr="state")
    assert result == "state"
    result = query_assembler(tit="state")
    assert result == "intitle:state"
    result = query_assembler(aut="state")
    assert result == "inauthor:state"
    result = query_assembler(pub="state")
    assert result == "inpublisher:state"
    result = query_assembler(sub="state")
    assert result == "subject:state"
    result = query_assembler(isb="state")
    assert result == "isbn:state"

    # Dpouble Arguments
    result = query_assembler(phr="state", tit="state")
    assert result == "state+intitle:state"
    result = query_assembler(aut="state", pub="state")
    assert result == "inauthor:state+inpublisher:state"
    result = query_assembler(sub="state", isb="state")
    assert result == "subject:state+isbn:state"

    # Triple Arguments
    result = query_assembler(phr="state", tit="state", aut="state")
    assert result == "state+intitle:state+inauthor:state"
    result = query_assembler(pub="state", sub="state", isb="state")
    assert result == "inpublisher:state+subject:state+isbn:state"

    # All Arguments
    result = query_assembler(
        phr="state",
        tit="state",
        aut="state",
        pub="state",
        sub="state",
        isb="state",
    )
    assert result == (
        "state+intitle:state+inauthor:state+inpublisher:state"
        + "+subject:state+isbn:state"
    )


def test_attr_collecter():
    """
    Provides a false dict as if from a real return.
    Should collect and return a dataclass with gathered attributes.
    """

    # Import function
    from tabby_server.services.library import attr_collecter, BookAttr

    # No Argument
    result = attr_collecter()
    assert result is None

    # No ISBN / No ISBN 13 / Only ISBN 13
    fake_book = {}
    result = attr_collecter(fake_book)
    assert result is None
    fake_book = {
        "industryIdentifiers": [
            {"identifier": "123", "type": "bad"},
            {"identifier": "456", "type": "bad"},
        ]
    }
    result = attr_collecter(fake_book)
    assert result is None
    fake_book = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}]
    }
    result = attr_collecter(fake_book)
    comparison = BookAttr(
        isbn="13",
        title="",
        authors="",
        rating="",
        summary="",
        thumbnail="",
        page_count="",
        categories="",
        publisher="",
        published_date="",
    )
    assert result == comparison

    # All Attributes
    fake_book = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}],
        "title": "t",
        "authors": ["a"],
        "averageRating": "r",
        "description": "d",
        "pageCount": "g",
        "categories": ["c"],
        "publisher": "b",
        "publishedDate": "p",
        "imageLinks": {"thumbnail": "n"},
    }
    result = attr_collecter(fake_book)
    new_book = BookAttr(
        isbn="13",
        title="t",
        authors=["a"],
        rating="r",
        summary="d",
        thumbnail="n",
        page_count="g",
        categories=["c"],
        publisher="b",
        published_date="p",
    )
    assert result == new_book
