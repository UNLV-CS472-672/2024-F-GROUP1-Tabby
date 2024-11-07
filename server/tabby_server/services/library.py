from dataclasses import dataclass, asdict, field
from flask import Blueprint, request
from dotenv import load_dotenv
from http import HTTPStatus
import requests
import os
import json

"""
Allows calling to Google Books API and returns only the attributes of the
assembled book inside a dataclass.

Does not return books that lack an ISBN 13 id.
"""

# Load the .env variables.
load_dotenv()

# Global Variables
MAX_RESULTS = 40  # Determines number of reults Google Books Returns (max 40)
API_KEY = str(os.getenv("API_KEY"))  # API Key to access Google Books

# Blueprint to be accessible from __main__.py.
# To call, use: "/library/<function_route>"
books_api = Blueprint("library", __name__)


# Dataclass to hold book attributes from the google books api call.
@dataclass(frozen=True, kw_only=True)
class Book:
    isbn: str
    title: str
    authors: list
    rating: str
    excerpt: str = field(init=False)  # Cannot be initialized
    summary: str = ""
    thumbnail: str
    page_count: str
    categories: list
    publisher: str
    published_date: str

    # After the dataclass is made, run this.
    def __post_init__(self) -> None:
        # Checks if summary is longer than 50 characters.
        # If it is, save the first 47 and add "..." to excerpt.
        # Otherwise, save the summary.
        if len(self.summary) > 50:
            object.__setattr__(self, "excerpt", f"{self.summary[:46]}...")
        else:
            object.__setattr__(self, "excerpt", self.summary)


def get_google_books_query(
    phrase: str = "",
    title: str = "",
    author: str = "",
    publisher: str = "",
    subject: str = "",
    isbn: str = "",
) -> str:
    """
    Assembles the completed query for the Google Books API. Parameters are
    the search criteria given to the system. In order to use them with Google
    Books, we have to include special terminology which this adds if such
    parameters were defined.

    Args:
        phrase:     Phrase parameter. Most Important. Searches everything.
        title:      Title parameter. Search by title.
        author:     Author parameter. Search by author.
        publisher:  Publisher parameter. Search by publisher.
        subject:    Subject parameter. Search by subject.
        isbn:       ISBN parameter. Search by isbn.

    Returns:
        complete: Fully assembled and formatted Google Books API search
                  query. This may remove the first character if no phrase was
                  given to avoid an errant '+'.
    """

    # Assembles the query here.
    # Uses concatenation and ternary statements to know what to include in
    # the final product.
    complete = (
        phrase
        + (f"+intitle:{title}" if title else "")
        + (f"+inauthor:{author}" if author else "")
        + (f"+inpublisher:{publisher}" if publisher else "")
        + (f"+subject:{subject}" if subject else "")
        + (f"+isbn:{isbn}" if isbn else "")
    )

    # Removes the first character if no primary phrase was given.
    # This is because it would leave a plus sign at the beginning otherwise.
    # If a phrase was given, just returns the whole thing then.
    return complete[1:] if not phrase else complete


def attr_collecter(book: dict = {}) -> dict[str, str]:
    """
    Gathers the attributes from a book entry given by Google Books API.
    Stores them in a dataclass and returns them. Returns nothing if the book
    lacks and ISBN 13 industry indentifier.

    Args:
        book: Current book's 'volumeInfo' key we are collecting from. This
              should be a dict containing all the information we need.

    Returns:
        Full Book() dataclass converted to a dict with current book attributes.
        If any attributes were blank, then they would be initialized as an
        empty string.
    """

    # Checks if there are any industry identifiers in the first place.
    if "industryIdentifiers" not in book:
        return {"blank": "no isbn 13"}

    # Checks to make sure an ISBN 13 exists for the entry.
    # If it does, save it.
    cur_isbn: str = ""
    for id in book["industryIdentifiers"]:
        if id["type"] == "ISBN_13":
            cur_isbn = id["identifier"]
            continue

    # If no ISBN 13 was found, skip this book.
    if not cur_isbn:
        return {"blank": "no isbn 13"}

    # Create dataclass when returning. Then convert it to a dict.
    # Only ISBN must not be None. All others can be whatever.
    return asdict(
        Book(
            # This was gathered earlier. If this did not exist,
            # we wouldn't be here.
            isbn=cur_isbn,
            # Attempts to collect attributes from the book if they exist.
            # If they don't, defaults to an empty string.
            title=book.get("title", ""),
            authors=book.get("authors", ""),
            rating=book.get("averageRating", ""),
            summary=book.get("description", ""),
            page_count=book.get("pageCount", ""),
            categories=book.get("categories", ""),
            publisher=book.get("publisher", ""),
            published_date=book.get("publishedDate", ""),
            # Must check if a thumbnail is provided wit this entry.
            # If any were, then we attempt to retrieve it.
            thumbnail=(
                book["imageLinks"].get("thumbnail", "")
                if "imageLinks" in book
                else ""
            ),
        )
    )


@books_api.route("/search/", methods=["GET"])
def google_books_search():
    """
    Call this with paramters to make a call to Google Books API.
    Returns nothing if no correct arguments are given.

    Args:
        phrase:     Primary search string. Looks for books with this string.
        title:      Looks for books titled with this string.
        author:     Looks for books authored with this string.
        publisher:  Looks for books published with this string.
        subject:    Looks for books with the subject of this string.
        isbn:       Looks for books with isbn matching this string.

    Returns:
        found_books: List of books and their attributes from Google Books API.
                     Books must have an ISBN 13 to be returned.
    """

    # If no arguments are given, return nothing. OR
    # If no expected arguement is given, return nothing.
    if not len(request.args) or not (
        request.args.get("phrase")
        or request.args.get("title")
        or request.args.get("author")
        or request.args.get("publisher")
        or request.args.get("subject")
        or request.args.get("isbn")
    ):
        return (
            {"badArgs": "Incorrect argument parameters"},
            HTTPStatus.BAD_REQUEST,
        )

    # Combines the arguments into a single usable phrase
    query = get_google_books_query(
        request.args.get("phrase", ""),
        request.args.get("title", ""),
        request.args.get("author", ""),
        request.args.get("publisher", ""),
        request.args.get("subject", ""),
        request.args.get("isbn", ""),
    )

    # Make call to Google Books with assembled query.
    # Save only the books themselves if any were found.
    response = requests.get(
        url="https://www.googleapis.com/books/v1/volumes",
        params={
            "key": API_KEY,
            "q": query,
            "maxResults": MAX_RESULTS,
        },
    )

    # Checks if books were returned. Entirely possible that no books matched
    # our search criteria.
    if "items" not in response.json():
        # Returns early if no books were found.
        return {"matchless": "No Books Match Criteria"}, HTTPStatus.OK
    items = response.json()["items"]

    # Loops through each book returned and collects their attributes.
    # Stops after the first book with an ISBN 13 is found.
    for book in items:
        cur_book = attr_collecter(book.get("volumeInfo", {}))
        # If a bad book was sent, we will get back a dict with the key "blank".
        if not cur_book.get("blank"):
            # Returns it as a json string.
            return json.dumps(cur_book, indent=4), HTTPStatus.OK

    # If no books with an ISBN 13 were found, we return an error.
    return {"error": "No Books Found"}, HTTPStatus.OK
