"""Tests services/google_books.py"""

from dataclasses import asdict
import json
import requests_mock
from tabby_server.services.google_books import (
    get_google_books_query,
    request_volumes_get,
    volume_info_to_book,
)


def test_get_google_books_query():
    """Tests get_google_books_query()"""

    # No args -> nothing
    assert get_google_books_query() == ""

    # Single args
    assert get_google_books_query(phrase="state") == "state"
    assert get_google_books_query(intitle="state") == "intitle:state"
    assert get_google_books_query(inauthor="state") == "inauthor:state"
    assert get_google_books_query(inpublisher="state") == "inpublisher:state"
    assert get_google_books_query(subject="state") == "subject:state"
    assert get_google_books_query(isbn="state") == "isbn:state"

    # Double args
    assert (
        get_google_books_query(phrase="state", intitle="state")
        == "state+intitle:state"
    )
    assert (
        get_google_books_query(inauthor="state", inpublisher="state")
        == "inauthor:state+inpublisher:state"
    )
    assert (
        get_google_books_query(subject="state", isbn="state")
        == "subject:state+isbn:state"
    )

    # Triple args
    assert (
        get_google_books_query(
            phrase="state", intitle="state", inauthor="state"
        )
        == "state+intitle:state+inauthor:state"
    )
    assert (
        get_google_books_query(
            inpublisher="state", subject="state", isbn="state"
        )
        == "inpublisher:state+subject:state+isbn:state"
    )
    assert get_google_books_query(
        phrase="state",
        intitle="state",
        inauthor="state",
        inpublisher="state",
        subject="state",
        isbn="state",
    ) == (
        "state+intitle:state+inauthor:state+inpublisher:state+subject:state"
        "+isbn:state"
    )


def test_volume_info_to_book():
    """Tests volume_info_to_book()."""

    # Empty, still passes
    volume_info = {}
    result = volume_info_to_book(volume_info)
    expected_as_dict = {
        "isbn": "",
        "title": "",
        "authors": "",
        "rating": -1.0,
        "excerpt": "...",
        "summary": "",
        "thumbnail": "",
        "page_count": -1,
        "genres": "",
        "publisher": "",
        "published_date": "",
    }
    assert asdict(result) == expected_as_dict

    # Has volume info with industry identifiers, but no ISBN 13
    volume_info = {
        "industryIdentifiers": [
            {"identifier": "123", "type": "bad"},
            {"identifier": "456", "type": "bad"},
        ]
    }
    result = volume_info_to_book(volume_info)
    expected_as_dict = {
        "isbn": "",
        "title": "",
        "authors": "",
        "rating": -1.0,
        "excerpt": "...",
        "summary": "",
        "thumbnail": "",
        "page_count": -1,
        "genres": "",
        "publisher": "",
        "published_date": "",
    }
    assert asdict(result) == expected_as_dict

    # Only ISBN 13
    # Passes but most attributes are blank
    volume_info = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}]
    }
    result = volume_info_to_book(volume_info)
    expected_as_dict = {
        "isbn": "13",
        "title": "",
        "authors": "",
        "rating": -1.0,
        "excerpt": "...",
        "summary": "",
        "thumbnail": "",
        "page_count": -1,
        "genres": "",
        "publisher": "",
        "published_date": "",
    }
    assert asdict(result) == expected_as_dict

    # All attributes
    volume_info = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}],
        "title": "t",
        "authors": ["a", "a2", "a3"],
        "averageRating": "r",
        "description": "d",
        "pageCount": "g",
        "categories": ["c", "c2", "c3"],
        "publisher": "b",
        "publishedDate": "p",
        "imageLinks": {"thumbnail": "n"},
    }
    result = volume_info_to_book(volume_info)
    expected_as_dict = {
        "isbn": "13",
        "title": "t",
        "authors": "a,a2,a3",
        "rating": -1.0,
        "excerpt": "d...",
        "summary": "d",
        "thumbnail": "n",
        "page_count": -1,
        "genres": "c,c2,c3",
        "publisher": "b",
        "published_date": "p",
    }
    assert asdict(result) == expected_as_dict


def test_request_volumes_get():
    """Tests request_volumes_get()."""

    with requests_mock.Mocker() as m:
        # Intercept messages to replace it with a bad response
        m.get(requests_mock.ANY, json={"book": "bad"})

        # No args -> no results
        assert request_volumes_get() == []

        # Correct arguments -> no results
        assert request_volumes_get(author="fake_author") == []

        # Intercept message to return two books
        m.get(
            requests_mock.ANY,
            json={
                "items": [
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
                ],
                "totalItems": 2,
            },
        )
        result = request_volumes_get(author="fake_author")
        assert len(result) == 2
        assert result[0].title == "APPLES"
        assert result[1].title == "BANANAS"

        # Test with a book with no volumeInfo
        m.get(
            requests_mock.ANY,
            json={
                "items": [
                    {},
                ],
                "totalItems": 1,
            },
        )
        assert request_volumes_get(author="fake_author") == []

        # Mock the test output
        with open("tests/flower_of_algernon_test_40_output.json", "r") as f:
            test_output = json.load(f)
            m.get(requests_mock.ANY, json=test_output)

        # Request it. Inputs don't matter, since we mocked the result.
        # Result should at least be 1 long.
        result = request_volumes_get(phrase="flowers", author="keyes")
        assert len(result) >= 1

        # Mock a bad response -> Empty list
        m.get(requests_mock.ANY, status_code=400, json={"msg": "bruh"})
        result = request_volumes_get(phrase="flowers", author="keyes")
        assert result == []
