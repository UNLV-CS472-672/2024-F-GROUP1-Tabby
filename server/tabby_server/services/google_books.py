"""Module for the Google Books API."""

from dataclasses import dataclass, field
import logging
import os
from pprint import pformat
from typing import Any
from dotenv import load_dotenv
import requests


load_dotenv()  # Loads .env if not loaded already

_MAX_RESULTS = 40
"""Maximum number of results returned by Google Books"""
_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY", "")
"""API key to get Google Books"""


@dataclass(frozen=True, kw_only=True)
class Book:
    """Represents a book. Created from a Google Books API call."""

    isbn: str
    title: str
    authors: str
    rating: str
    excerpt: str = field(init=False)  # Cannot be initialized
    summary: str
    thumbnail: str
    page_count: str
    genres: str
    publisher: str
    published_date: str

    def __post_init__(self) -> None:
        """Called after initialization."""
        object.__setattr__(self, "excerpt", f"{self.summary[:46]}...")


@dataclass
class BooksInvalid:
    """An error value for when a result fails."""

    message: str


def get_google_books_query(
    phrase: str = "",
    intitle: str = "",
    inauthor: str = "",
    inpublisher: str = "",
    subject: str = "",
    isbn: str = "",
) -> str:
    """Assembles the completed query for the Google Books API. Parameters are
    the search criteria given to the system. In order to use them with Google
    Books, we have to include special terminology which this adds if such
    parameters were defined.

    Args:
        phrase:       Phrase parameter. Most Important. Searches everything.
        intitle:      Title parameter.
        inauthor:     Author parameter.
        inpublisher:  Publisher parameter.
        subject:      Subject parameter.
        isbn:         ISBN parameter.

    Returns:
        Fully assembled and formatted Google Books API search query. Each part
        is separated by '+'.
    """
    # Append parts if they exist, then join together with '+'.
    parts = []
    if phrase:
        parts.append(phrase)
    if intitle:
        parts.append(f"intitle:{intitle}")
    if inauthor:
        parts.append(f"inauthor:{inauthor}")
    if inpublisher:
        parts.append(f"inpublisher:{inpublisher}")
    if subject:
        parts.append(f"subject:{subject}")
    if isbn:
        parts.append(f"isbn:{isbn}")
    return "+".join(parts)


def volume_info_to_book(volume_info: dict[str, Any]) -> Book:
    """Converts a Google Books JSON item into a Book object.

    Args:
        item: Dictionary containing the JSON information.
    Returns:
        Book object.
    """

    # Get ISBN
    isbn = ""
    for iid in volume_info.get("industryIdentifiers", []):
        if iid["type"] == "ISBN_13":
            isbn = iid["identifier"]
            break

    # ISBN filtering has been moved to outside this function, because it can
    # be done outside of the function (it is not this function's
    # responsibility)

    # Collect attributes into a Book object
    # - Any attributes that don't exist are replaced with ""
    # - Sequences are joined into a string, elements separated by commas
    return Book(
        isbn=isbn,
        title=volume_info.get("title", ""),
        authors=",".join(volume_info.get("authors", [])),
        rating=volume_info.get("averageRating", ""),
        summary=volume_info.get("description", ""),
        page_count=volume_info.get("pageCount", ""),
        genres=",".join(volume_info.get("categories", [])),
        publisher=volume_info.get("publisher", ""),
        published_date=volume_info.get("publishedDate", ""),
        thumbnail=(
            volume_info["imageLinks"].get("thumbnail", "")
            if "imageLinks" in volume_info
            else ""
        ),
    )


def request_volumes_get(
    phrase: str = "",
    title: str = "",
    author: str = "",
    publisher: str = "",
    subject: str = "",
    isbn: str = "",
) -> list[Book]:
    """Makes a call to Google Books /volumes endpoint to GET a set of books
    via query.

    Args:
        phrase:       Phrase parameter. Most Important. Searches everything.
        intitle:      Title parameter.
        inauthor:     Author parameter.
        inpublisher:  Publisher parameter.
        subject:      Subject parameter.
        isbn:         ISBN parameter.

    Returns:
        List of Book objects collected from Google Books.
    """

    # Assemble query to search
    query = get_google_books_query(
        phrase=phrase,
        intitle=title,
        inauthor=author,
        inpublisher=publisher,
        subject=subject,
        isbn=isbn,
    )

    # Invoke Google Books with the assembled query
    response = requests.get(
        url="https://www.googleapis.com/books/v1/volumes",
        params={
            "key": _API_KEY,
            "q": query,
            "maxResults": _MAX_RESULTS,
        },
    )

    # Catch bad responses
    if not (200 <= response.status_code <= 299):
        logging.info(f"Bad response ({response.status_code}):")
        logging.info(pformat(response.json()))
        return []

    response_json = response.json()

    # If no items found, return empty list
    if response_json.get("totalItems", 0) <= 0:
        logging.info("No items found in Google Books response.")
        return []

    # Iterate through each JSON item, collecting each valid book.
    books: list[Book] = []
    for item in response_json["items"]:
        volume_info = item.get("volumeInfo")
        if not volume_info:  # Skip bad books
            continue

        book = volume_info_to_book(volume_info)
        books.append(book)

    return books
