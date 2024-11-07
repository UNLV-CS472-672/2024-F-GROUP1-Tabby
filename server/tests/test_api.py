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
                and "categories" in result
                and "publisher" in result
                and "published_date" in result
            )


def test_get_google_books_query():
    """
    Provides false parameters for a mock query.
    Should format the given parameters into a specific string.
    """

    # Import function
    from tabby_server.services.library import get_google_books_query

    # No Arguments
    # Nothing to format if nothing was given.
    result = get_google_books_query()
    assert result == ""

    # Single Arguments Only
    # Formatting is basic. No plusses at the beginning.
    result = get_google_books_query(phrase="state")
    assert result == "state"
    result = get_google_books_query(title="state")
    assert result == "intitle:state"
    result = get_google_books_query(author="state")
    assert result == "inauthor:state"
    result = get_google_books_query(publisher="state")
    assert result == "inpublisher:state"
    result = get_google_books_query(subject="state")
    assert result == "subject:state"
    result = get_google_books_query(isbn="state")
    assert result == "isbn:state"

    # Double Arguments
    # No plusses at the beginning.
    result = get_google_books_query(phrase="state", title="state")
    assert result == "state+intitle:state"
    result = get_google_books_query(author="state", publisher="state")
    assert result == "inauthor:state+inpublisher:state"
    result = get_google_books_query(subject="state", isbn="state")
    assert result == "subject:state+isbn:state"

    # Triple Arguments
    # No plusses at the beginning.
    result = get_google_books_query(
        phrase="state", title="state", author="state"
    )
    assert result == "state+intitle:state+inauthor:state"
    result = get_google_books_query(
        publisher="state", subject="state", isbn="state"
    )
    assert result == "inpublisher:state+subject:state+isbn:state"

    # All Arguments
    # This is technically a compatible query.
    result = get_google_books_query(
        phrase="state",
        title="state",
        author="state",
        publisher="state",
        subject="state",
        isbn="state",
    )
    assert result == (
        "state+intitle:state+inauthor:state+inpublisher:state"
        + "+subject:state+isbn:state"
    )


def test_attr_collecter():
    """
    Provides a false dict as if from a real return.
    Should collect and return a dataclass turned dict with gathered attributes.
    """

    # Import function
    from tabby_server.services.library import attr_collecter

    # No Argument
    result = attr_collecter()
    assert result is not None and "blank" in result

    # No industryIdentifiers
    fake_book = {}
    result = attr_collecter(fake_book)
    assert result is not None and "blank" in result

    # No ISBN 13
    # Should fail.
    fake_book = {
        "industryIdentifiers": [
            {"identifier": "123", "type": "bad"},
            {"identifier": "456", "type": "bad"},
        ]
    }
    result = attr_collecter(fake_book)
    assert result is not None and "blank" in result

    # Only ISBN 13. Nothing Else.
    # Should pass. But most things are blank.
    # Basic Dict that passes.
    fake_book = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}]
    }
    result = attr_collecter(fake_book)
    # This is a theoretically possible book return.
    comparison = {
        "isbn": "13",
        "title": "",
        "authors": "",
        "rating": "",
        "excerpt": "",
        "summary": "",
        "thumbnail": "",
        "page_count": "",
        "categories": "",
        "publisher": "",
        "published_date": "",
    }
    assert result == comparison

    # All Attributes
    # More complete but basic dict.
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
    # This what it would look more like usually.
    comparison = {
        "isbn": "13",
        "title": "t",
        "authors": ["a"],
        "rating": "r",
        "excerpt": "d",
        "summary": "d",
        "thumbnail": "n",
        "page_count": "g",
        "categories": ["c"],
        "publisher": "b",
        "published_date": "p",
    }
    assert result == comparison
