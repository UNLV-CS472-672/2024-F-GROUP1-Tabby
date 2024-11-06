from flask import Blueprint, request
from http import HTTPStatus
import requests
import os
from dotenv import load_dotenv
from dataclasses import dataclass

"""
Allows calling to Google Books API and returns only the attributes of the
assembled book inside a dataclass.

Does not return books that lack an ISBN 13 id.
"""

# Load the .env variables.
load_dotenv()

# Blueprint to be accessible from __main__.py.
# To call, use: "/library/<function_route>"
books_api = Blueprint("library", __name__)


# Dataclass to hold book attributes from the google books api call.
@dataclass(frozen=True, kw_only=True)
class BookAttr:
    isbn: int
    title: str
    authors: list
    rating: str
    summary: str
    thumbnail: str
    page_count: str
    categories: list
    publisher: str
    published_date: str


def parameter_handler(param="", index=-1):
    """
    Takes in search string parameters for google books and converts them into
    useable strings by the Google API.

    Args:
        param: Given parameter from the caller.
        index: Type of parameter this is supposed to fill (author, title, etc.)
            0: title
            1: author
            2: publisher
            3: subject
            4: isbn
            else: N/A

    Returns:
        complete_param: Completed parameter usable by Google Books API
                        depending on type of parameter.
    """

    match (index):
        case 0:
            return "+intitle:" + param
        case 1:
            return "+inauthor:" + param
        case 2:
            return "+inpublisher:" + param
        case 3:
            return "+subject:" + param
        case 4:
            return "+isbn:" + param
        case _:
            return param


def query_assembler(phr="", tit="", aut="", pub="", sub="", isb=""):
    """
    Assembles the completed query for the Google Books API.

    Args:
        phr: Phrase parameter.
        tit: Title parameter.
        aut: Author parameter.
        pub: Publisher parameter.
        sub: Subject parameter.
        isb: ISBN parameter.
        num: Number of passed arguments.
    Returns:
        complete: Fully assembled and formatted Google Books API search
                  query.
    """

    # Assembles the query here.
    complete = (
        (phr)
        + (parameter_handler(tit, 0) if tit else "")
        + (parameter_handler(aut, 1) if aut else "")
        + (parameter_handler(pub, 2) if pub else "")
        + (parameter_handler(sub, 3) if sub else "")
        + (parameter_handler(isb, 4) if isb else "")
    )

    # Removes the first character if no primary phrase was given.
    # This is because it would be a plus sign if no phrase was given.
    if not phr and complete:
        complete = complete[1:]

    return complete


def attr_collecter(book={}):
    """
    Gathers the attributes from a book entry given by Google Books API.
    Stores them in a dataclass.

    Args:
        book: Current book's 'volumeInfo' key we are collecting from.

    Returns:
        Full BookAttr() dataclass with current book attributes.
    """

    # Checks to make sure an ISBN 13 exists for the entry.
    # If it does, save it.
    if "industryIdentifiers" not in book:
        return None
    new_isbn = ""
    for id in book["industryIdentifiers"]:
        if id["type"] == "ISBN_13":
            new_isbn = id["identifier"]
            continue

    # If no ISBN 13 was found, skip this book.
    if not new_isbn:
        return None

    # Collect attributes from the book if they exist.
    new_title = book.get("title", "")
    new_authors = book.get("authors", "")
    new_rating = book.get("averageRating", "")
    new_summary = book.get("description", "")
    new_page_count = book.get("pageCount", "")
    new_categories = book.get("categories", "")
    new_publisher = book.get("publisher", "")
    new_published_date = book.get("publishedDate", "")

    # Must check if a thumbnail is provided.
    # If it is, save it.
    new_thumbnail = ""
    if "imageLinks" in book:
        new_thumbnail = book["imageLinks"].get("thumbnail", "")

    # Create dataclass when returning.
    # Only ISBN must be not None.
    return BookAttr(
        isbn=new_isbn,
        title=new_title,
        authors=new_authors,
        rating=new_rating,
        summary=new_summary,
        thumbnail=new_thumbnail,
        page_count=new_page_count,
        categories=new_categories,
        publisher=new_publisher,
        published_date=new_published_date,
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
    query = query_assembler(
        request.args.get("phrase", ""),
        request.args.get("title", ""),
        request.args.get("author", ""),
        request.args.get("publisher", ""),
        request.args.get("subject", ""),
        request.args.get("isbn", ""),
    )

    # Basic aspects of the Google Books API call.
    api_http = "https://www.googleapis.com/books/v1/volumes?q="
    api_key = "&key=" + os.getenv("API_KEY")
    api_max = "&maxResults=40"

    # Make call to Google Books with assembled query.
    # Save only the books themselves if any were found.
    response = requests.get(api_http + query + api_key + api_max)
    if "items" not in response.json():
        return {"error": "No Books Found"}, HTTPStatus.OK
    items = response.json()["items"]

    # Loops through each book returned and collects their attributes.
    # Appends them to a list. List only holds the dataclass BookAttr().
    found_books = []
    for book in items:
        cur_book = attr_collecter(book["volumeInfo"])
        if cur_book is not None:
            found_books.append(cur_book)

    # Returns list of BookAttr() with assembled book attributes.
    return {"books": found_books, "number": len(found_books)}, HTTPStatus.OK
