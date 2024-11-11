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
    result = collect_book_attrs(fake_book)
    # This what it would look more like usually.
    comparison = {
        "isbn": "13",
        "title": "t",
        "authors": ["a"],
        "rating": "r",
        "excerpt": "d...",
        "summary": "d",
        "thumbnail": "n",
        "page_count": "g",
        "categories": ["c"],
        "publisher": "b",
        "published_date": "p",
    }
    assert result == comparison
