from io import BytesIO
from typing import Any, Callable
from unittest.mock import Mock
import numpy as np
import requests_mock
from tabby_server.__main__ import app
from flask.testing import FlaskClient
from http import HTTPStatus
import logging
import pytest
from tabby_server.vision import extraction, ocr
from werkzeug.datastructures import FileStorage


@pytest.fixture()
def client():
    return app.test_client()


@pytest.fixture(scope="function")
def mock_recognizer(request):

    original_function = ocr.TextRecognizer.find_text

    ocr.TextRecognizer.find_text = Mock()
    ocr.TextRecognizer.find_text.return_value = [
        ocr.RecognizedText(
            text="abc",
            corners=np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]]),
            confidence=0.9,
        )
    ]

    def teardown():
        ocr.TextRecognizer.find_text = original_function

    request.addfinalizer(teardown)


@pytest.fixture(scope="function")
def mock_extract(request):

    original_function = extraction.extract_from_recognized_texts

    extraction.extract_from_recognized_texts = Mock()
    extraction.extract_from_recognized_texts.return_value = None

    def set_value(value):
        extraction.extract_from_recognized_texts.return_value = value

    def teardown():
        extraction.extract_from_recognized_texts = original_function

    request.addfinalizer(teardown)

    return set_value


@pytest.fixture(scope="function")
def mock_chat_completion() -> Callable[[Any], None]:
    """Fixture to mock the result of a chat completion."""

    import openai.resources.chat

    result = None

    def mock_create(self, **kwargs) -> Any:
        return result

    openai.resources.chat.Completions.create = mock_create  # type: ignore

    def set_result(new_result: Any) -> None:
        nonlocal result
        result = new_result

    return set_result


@pytest.mark.usefixtures("client")
class TestAPIEndpoint:
    def test_first_funct(self, client, mock_extract):
        # Test Test
        result = client.get("/members")

        assert result.status_code == HTTPStatus.OK

    def test_test(self, client):
        response = client.post("/api/test")

        logging.info(response.json)
        assert response.json is not None and "message" in response.json
        assert response.status_code == HTTPStatus.OK

    @pytest.mark.usefixtures("mock_recognizer")
    def test_scan_cover(self, client: FlaskClient, mock_extract):
        """Tests endpoint /books/scan_cover"""

        # Blank
        response = client.post("books/scan_cover")
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # JSON is not acceptable
        response = client.post("books/scan_cover", json={})
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Try with a bad text file

        # ai-gen start (ChatGPT-4o, 2)
        data = BytesIO(b"dummy file content")
        data.seek(0)
        file = FileStorage(
            data, filename="testfile.txt", content_type="text/plain"
        )
        response = client.post("/books/scan_cover", data={"file": file})
        # ai-gen end

        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        image_bytes: bytes
        with open("tests/img/cpp.jpg", "rb") as f:
            image_bytes = f.read()

        # Test that it returns nothing when it extracts no author
        mock_extract(None)
        response = client.post("/books/scan_cover", data=BytesIO(image_bytes))
        logging.info(response.json)
        assert response.status_code == HTTPStatus.OK
        assert response.json is not None and "message" in response.json
        assert "message" in response.json
        assert "results" in response.json
        assert "resultsCount" in response.json
        assert (
            response.json["resultsCount"] == len(response.json["results"]) == 0
        )

        # Test with Google Books fail
        case1_result = extraction.ExtractionResult(
            options=[
                extraction.ExtractionOption(
                    title="KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE",  # noqa: E501
                    author="HA-JOON CHANG",
                ),
                extraction.ExtractionOption(
                    title="KICKING AWAY THE LADDER",
                    author="HA-JOON CHANG",
                ),
                extraction.ExtractionOption(
                    title="DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE",
                    author="HA-JOON CHANG",
                ),
                extraction.ExtractionOption(
                    title="KICKING AWAY THE LADDER: IN HISTORICAL PERSPECTIVE",
                    author="HA-JOON CHANG",
                ),
                extraction.ExtractionOption(
                    title="KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY",
                    author="HA-JOON CHANG",
                ),
            ],
        )
        mock_extract(case1_result)
        with requests_mock.Mocker() as m:
            google_books_url = "https://www.googleapis.com/books/v1/volumes"
            m.get(google_books_url, status_code=500)

            response = client.post(
                "/books/scan_cover", data=BytesIO(image_bytes)
            )

            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert response.json is not None and "message" in response.json
            assert "message" in response.json
            assert "results" in response.json
            assert "resultsCount" in response.json
            assert (
                response.json["resultsCount"]
                == len(response.json["results"])
                == 0
            )

        # Test success
        with requests_mock.Mocker() as m:
            google_books_url = "https://www.googleapis.com/books/v1/volumes"

            items = [
                {
                    "volumeInfo": {
                        "title": "APPLES",
                        "industryIdentifiers": [
                            {"identifier": "1234243532", "type": "ISBN_13"},
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
                {
                    "volumeInfo": {
                        "title": "CHERRIES",
                        "industryIdentifiers": [
                            {"identifier": "1243567", "type": "ISBN_13"},
                            {"identifier": "456", "type": "bad"},
                        ],
                    }
                },
            ]
            m.get(
                google_books_url,
                json={"items": items, "totalItems": len(items)},
            )

            response = client.post(
                "/books/scan_cover", data=BytesIO(image_bytes)
            )

            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert response.json is not None
            assert "message" in response.json
            assert "results" in response.json
            assert "resultsCount" in response.json
            assert (
                response.json["resultsCount"]
                == len(response.json["results"])
                == 2
            )
            results = response.json["results"]
            assert results[0]["title"] == "APPLES"
            assert results[1]["title"] == "CHERRIES"

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

            # Success, 2 results out of 3 results
            items = [
                {
                    "volumeInfo": {
                        "title": "APPLES",
                        "industryIdentifiers": [
                            {"identifier": "1234243532", "type": "ISBN_13"},
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
                {
                    "volumeInfo": {
                        "title": "CHERRIES",
                        "industryIdentifiers": [
                            {"identifier": "1243567", "type": "ISBN_13"},
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
            assert response.json["results"][1]["title"] == "CHERRIES"

    # Test call to YOLO object recognition. Uses a 0 as a parameter so data
    # is not saved from pytest call.
    def test_predict_examples(self, client):
        # Calls for the model to run object detection on example images.
        # Does not save the results.
        result = client.get("/yolo/shelf_read")

        # This should always return true.
        assert result.status_code == HTTPStatus.OK
        assert result.json is not None and "shelf_1" in result.json

    def test_recommendations(
        self, client: FlaskClient, mock_chat_completion: Callable[[Any], None]
    ) -> None:
        """Tests the /books/recommendations endpoint."""

        url = "/books/recommendations"

        # Test empty -> fail
        response = client.get(url)
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test one missing arg -> fail
        response = client.get(
            url,
            query_string={
                # "titles": "To Kill a Mockingbird",
                "authors": "Harper Lee",
                "weights": "0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "To Kill a Mockingbird",
                # "authors": "Harper Lee",
                "weights": "0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "To Kill a Mockingbird",
                "authors": "Harper Lee",
                # "weights": "0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test all blank -> fail
        response = client.get(
            url,
            query_string={
                "titles": "",
                "authors": "",
                "weights": "",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test float conversion
        response = client.get(
            url,
            query_string={
                "titles": "T |---| U",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---| aa |---| 0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test in-range floats
        response = client.get(
            url,
            query_string={
                "titles": "T |---| U",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---| -1.0 |---| 0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "T |---| U",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---| 1.1 |---| 0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test different sizes -> fail
        # 2 vs. 3 vs. 3
        response = client.get(
            url,
            query_string={
                "titles": "T |---| U",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---| 1.0 |---| 0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # 3 vs. 2 vs. 3
        response = client.get(
            url,
            query_string={
                "titles": "T |---| U |---| V",
                "authors": "A |---| B",
                "weights": "0.5 |---| 1.0 |---| 0.5",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test blank elements -> fail
        response = client.get(
            url,
            query_string={
                "titles": "T |---|   |---| V",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---| 0.6 |---| 0.7",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "T |---| U |---| V",
                "authors": "A |---|   |---| C",
                "weights": "0.5 |---| 0.6 |---| 0.7",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "T |---| U |---| V",
                "authors": "A |---| B |---| C",
                "weights": "0.5 |---|  |---| 0.7",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        response = client.get(
            url,
            query_string={
                "titles": "T |---| U |---|",
                "authors": "A |---| B |---| C",
                "authors": "0.5 |---| 0.6 |---| 0.7",
            },
        )
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        mock_completion = Mock()
        mock_chat_completion(mock_completion)

        # Make good query string
        query_string_good = {
            "titles": "T |---| U |---| V",
            "authors": "A |---| B |---| C",
            "weights": "0.5 |---| 0.6 |---| 0.7",
        }

        # Test no choices from ChatGPT -> fail
        mock_completion.choices = []
        response = client.get(url, query_string=query_string_good)
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Test no message content -> fail
        mock_completion.choices.append(Mock())
        mock_completion.choices[0].message = Mock()
        mock_completion.choices[0].message.content = None
        response = client.get(url, query_string=query_string_good)
        logging.info(response.json)
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert response.json is not None and "message" in response.json

        # Mock completion should return success
        expected_tags = [f"tag{i}" for i in range(1, 11)]
        successful_output = "\n".join(expected_tags)
        mock_completion.choices[0].message.content = successful_output

        # Start mocking requests
        with requests_mock.Mocker() as m:

            google_books_url = "https://www.googleapis.com/books/v1/volumes"

            # Test bad call from Google Books -> success but empty
            m.get(google_books_url, status_code=500)
            response = client.get(url, query_string=query_string_good)
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert response.json is not None
            assert "message" in response.json
            assert "results" in response.json
            assert "resultsCount" in response.json
            results = response.json["results"]
            assert results == []
            assert response.json["resultsCount"] == 0

            # Fix response from Google books
            # The result should be 2 books (one doesn't have ISBN 13)
            items = [
                {
                    "volumeInfo": {
                        "title": "APPLES",
                        "industryIdentifiers": [
                            {"identifier": "1234243532", "type": "ISBN_13"},
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
                {
                    "volumeInfo": {
                        "title": "CHERRIES",
                        "industryIdentifiers": [
                            {"identifier": "1243567", "type": "ISBN_13"},
                            {"identifier": "456", "type": "bad"},
                        ],
                    }
                },
            ]
            m.get(
                google_books_url,
                json={"items": items, "totalItems": len(items)},
            )

            # Test good call with 3 elements -> success
            response = client.get(url, query_string=query_string_good)
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
            assert response.json is not None
            assert "message" in response.json
            assert "results" in response.json
            assert "resultsCount" in response.json
            results = response.json["results"]
            assert results[0]["title"] == "APPLES"
            assert results[1]["title"] == "CHERRIES"

            # Test good call with 5 elements -> success
            response = client.get(
                url,
                query_string={
                    "titles": "T |---| U |---| V |---|W|---|E",
                    "authors": "A |---| B |---| C |---|D|---|E",
                    "weights": "0.1 |---| 0.2 |---| 0.3 |---|0.4|---|0.5",
                },
            )
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK

            # Test good call with 1 element -> success
            response = client.get(
                url,
                query_string={
                    "titles": "T|---asdfi.g,lp E",  # no separator -> 1 element
                    "authors": "A,jasdf|--- E",
                    "weights": "0.5",
                },
            )
            logging.info(response.json)
            assert response.status_code == HTTPStatus.OK
