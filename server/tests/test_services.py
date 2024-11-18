import json
import requests_mock
from http import HTTPStatus


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


def test_collect_book_attrs():
    """
    Provides a false dict as if from a real return.
    Should collect and return a dataclass turned dict with gathered attributes.
    """

    # Import function
    from tabby_server.services.library import collect_book_attrs

    # No Argument
    result = collect_book_attrs()
    assert result is not None and "blank" in result

    # No industryIdentifiers
    fake_book = {}
    result = collect_book_attrs(fake_book)
    assert result is not None and "blank" in result

    # No ISBN 13
    # Should fail.
    fake_book = {
        "industryIdentifiers": [
            {"identifier": "123", "type": "bad"},
            {"identifier": "456", "type": "bad"},
        ]
    }
    result = collect_book_attrs(fake_book)
    assert result is not None and "blank" in result

    # Only ISBN 13. Nothing Else.
    # Should pass. But most things are blank.
    # Basic Dict that passes.
    fake_book = {
        "industryIdentifiers": [{"identifier": "13", "type": "ISBN_13"}]
    }
    result = collect_book_attrs(fake_book)
    # This is a theoretically possible book return.
    comparison = {
        "isbn": "13",
        "title": "",
        "authors": "",
        "rating": "",
        "excerpt": "...",
        "summary": "",
        "thumbnail": "",
        "page_count": "",
        "genres": "",
        "publisher": "",
        "published_date": "",
    }
    assert result == comparison

    # All Attributes
    # More complete but basic dict.
    fake_book = {
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
    result = collect_book_attrs(fake_book)
    # This what it would look more like usually.
    comparison = {
        "isbn": "13",
        "title": "t",
        "authors": "a,a2,a3",
        "rating": "r",
        "excerpt": "d...",
        "summary": "d",
        "thumbnail": "n",
        "page_count": "g",
        "genres": "c,c2,c3",
        "publisher": "b",
        "published_date": "p",
    }
    assert result == comparison


def test_google_books_search():
    """
    Is a direct call to the Google Books Search Function.
    This will fully test its capability. Should return a dict with book
    information.
    """

    # Import function
    from tabby_server.services.library import google_books_search

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

        # No Arguments Given.
        # This should fail.
        result = google_books_search()
        assert result[0] is not None and "badArgs" in result[0]
        assert result[1] == HTTPStatus.BAD_REQUEST

        # Correct Arguments, but No Results
        # The values here don't matter so long as the argument key is
        # valid. This should pass but we have it see nothing at right now.
        result = google_books_search(author="fake_author")
        assert result[0] is not None and "matchless" in result[0]
        assert result[1] == HTTPStatus.OK

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
        result = google_books_search(author="fake_author")
        assert result[0] is not None and "error" in result[0]
        assert result[1] == HTTPStatus.OK

        # Intercept an request message and make it always return the
        # example json.
        # Now all requests will return that full json we have.
        m.get(requests_mock.ANY, json=test_output)

        # Flowers of Algernon Request.
        # Again, our values don't actually matter but this is what was
        # used to get our example anyways.
        result = google_books_search(phrase="flowers", author="keyes")
        # The return is actually a json string. So we convert it into
        # a dict object to work with instead.
        # This will have all attributes from the Book() dataclass.
        assert result[1] == HTTPStatus.OK
        result = json.loads(result[0])
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
