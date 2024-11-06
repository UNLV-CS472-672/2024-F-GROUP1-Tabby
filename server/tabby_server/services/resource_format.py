from flask import Blueprint
from http import HTTPStatus
from typing import Any
import requests
import os
from dotenv import load_dotenv


load_dotenv()  # Use 'os.getenv("KEY")' to get values.

# Apparently necessary to import from a .env file?
# If there is a better way, do tell please.


"""
Test bed to creating what may be returned by the GoogleBooks API.
Likely to be deleted later.
"""

# Blueprint for this file. Adds the 'test' prefix in __main__.py.
# To call functions in this file use "/test/<function_route>"
books_test = Blueprint('books_test', __name__)


# This call is an example given by Google Books documentation.
#   https://developers.google.com/books/docs/v1/using#request
# These are some Optional parameters.
#   https://developers.google.com/books/docs/v1/using#st_params

# To prevent unncessary call usage, I have copied the output of
# this query into .txt files.


# Class variable to hold the result of the api call
class ApiTesting:
    # Empty for now. Will hold the result from google books.
    output_dict: dict[str, Any] = {}  # dict


# Declares the class variable.
result_dict = ApiTesting()


# Makes the request to google books if not already done.
# In actual code, this may come in the form of checking that
# search terms are different to prevent unncessary calling.

@books_test.route('/make_request', methods=["GET"])
def google_books_test_call_api():
    if not bool(result_dict.output_dict):
        # In reality, it would check if the search terms are exactly the same
        # as before. If they are, it would just call an easy return that was
        # gotten previously. Thus saving an API call and processing.

        # ------- NEEDED TO WORK -------
        # I break it up so it doesn't go over the Flake8 character limit.
        api_key_var = "&key="  # Look in Discord for this.
        api_http = "https://www.googleapis.com/books/v1/volumes?q="  # http
        api_search = "flowers+inauthor:keyes"  # Search terms
        api_max = "&maxResults="  # Max Var
        api_results = "40"  # 40 is the maximum. 10 is default.

        api_key = os.getenv("API_KEY")  # Retrieve the API key.
        # This tests for none type. If it nonetype, then it makes it a string
        # https://stackoverflow.com/questions/23086383/how-to-test-nonetype-in-python
        if api_key is None:
            api_key = " "

        api_url = (
            api_http
            + api_search
            + api_key_var
            + api_key
            + api_max
            + api_results
        )

        response = requests.get(api_url)  # Google Books API Request
        result_dict.output_dict = response.json()  # Converts output to a dict.

    # Returns the complete output of the API call.
    return result_dict.output_dict, HTTPStatus.OK


# Generic function for (hopefully) cleaner readability when it comes to
# retrieving info about books.

def get_book_attribute(book_list, book_attr):
    try:
        return book_list["volumeInfo"][book_attr]
    except KeyError:
        return None


# This grabs some settings of the books entered found from Google Books.
# This has a check to skip a book if the isbn does not exist.
# All information is in a try_except because not all results have the
# necessary variables to return.

@books_test.route('/all_books', methods=["GET"])
def google_books_test_all_books():
    # Gets the actual book results in the form of a list.
    items = []
    try:
        items = result_dict.output_dict["items"]
    except KeyError:
        pass

    if bool(items):
        # List that holds all the dicts for each book.
        all_books = []

        for i in range(len(items)):
            # Dict to hold the individual book attributes
            entry = {}

            # Only keeps the entry if the isbn could be found. Only keeps the
            # isbn 13.
            try:
                # Purely to get under the Flake8 character limit.
                isbnid = "industryIdentifiers"

                # Initalizes isbn key
                entry['isbn'] = ""

                # If there is a list of isbn's, loop through it.
                # Find the isbn with a tage of isbn_13 and save it.
                # If none exist, then save none of them.
                if type(items[i]["volumeInfo"][isbnid]) is list:
                    for j in range(len(items[i]["volumeInfo"][isbnid])):
                        try:
                            # This only exists to spite the flake8 limit.
                            isbn_entry = {}
                            isbn_entry = items[i]["volumeInfo"][isbnid][j]
                            if isbn_entry['type'] == "ISBN_13":
                                entry['isbn'] = isbn_entry['identifier']
                                break
                        except KeyError:
                            continue

                # Check to see if a isbn_13 key was found.
                # Don't save this entry if not found.
                if entry['isbn'] == "":
                    continue
            except KeyError:
                continue

            # entry['title'] = items[i]["volumeInfo"]["title"]
            entry['title'] = get_book_attribute(items[i], "title")

            # entry['author'] = items[i]["volumeInfo"]["authors"]
            entry['author'] = get_book_attribute(items[i], "authors")

            # entry['summary'] = items[i]["volumeInfo"]["description"]
            entry['summary'] = get_book_attribute(items[i], "description")

            # entry['publisher'] = items[i]["volumeInfo"]["publisher"]
            entry['publisher'] = get_book_attribute(items[i], "publisher")

            # entry['thumbnail'] = items[i]["volumeInfo"]["imageLinks"]
            entry['thumbnail'] = get_book_attribute(items[i], "imageLinks")

            # Once the attributes are obtained, that book is added to a list.
            all_books.append(entry)

        # Adds a key with a list that holds a dict for all the books and their
        # attributes.
        complete_list = {"books": all_books, "number": len(all_books)}

        return complete_list, HTTPStatus.OK
    else:
        # Call to Google Books not made.
        return {"empty": "none"}, HTTPStatus.BAD_REQUEST
