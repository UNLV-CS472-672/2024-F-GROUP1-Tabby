from http import HTTPStatus
import requests
import os
from dotenv import load_dotenv

# from tabby_server.__main__ import app     # Use when running pytest
# from __main__ import app    # Use when actually running the server


load_dotenv()  # Use 'os.getenv("KEY")' to get values.

# Apparently necessary to import from a .env file?
# If there is a better way, do tell please.


"""
Test bed to creating what may be returned by the GoogleBooks API.
Likely to be deleted later.
"""


# This call is an example given by Google Books documentation.
#   https://developers.google.com/books/docs/v1/using#request
# These are some Optional parameters.
#   https://developers.google.com/books/docs/v1/using#st_params

# To prevent unncessary call usage, I have copied the output of
# this query into .txt files.


# Class variable to hold the result of the api call
class ApiTesting:
    # Empty for now. Will hold the result from google books.
    output_dict = {}  # dict


# Declares the class variable.
result_dict = ApiTesting()


# Makes the request to google books if not already done.
# In actual code, this may come in the form of checking that
# search terms are different to prevent unncessary calling.


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

        api_url = api_http + api_search + api_key_var + api_key + api_max + api_results

        response = requests.get(api_url)  # Google Books API Request
        result_dict.output_dict = response.json()  # Converts output to a dict.

    # Returns the complete output of the API call.
    return result_dict.output_dict, HTTPStatus.OK


# This grabs some settings of the books entered found from Google Books.
# This has a check to skip a book if the isbn does not exist.
# All information is in a try_except because not all results have the
# necessary variables to return.


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

            try:
                entry["isbn"] = items[i]["volumeInfo"]["industryIdentifiers"]
            except KeyError:
                continue

            try:
                entry["title"] = items[i]["volumeInfo"]["title"]
            except KeyError:
                pass

            try:
                entry["author"] = items[i]["volumeInfo"]["authors"]
            except KeyError:
                pass

            try:
                entry["summary"] = items[i]["volumeInfo"]["description"]
            except KeyError:
                pass

            try:
                entry["publisher"] = items[i]["volumeInfo"]["publisher"]
            except KeyError:
                pass

            try:
                entry["reviews"] = items[i]["volumeInfo"]["averageRating"]
            except KeyError:
                pass

            try:
                entry["thumbnail"] = items[i]["volumeInfo"]["imageLinks"]
            except KeyError:
                pass

            # Once the attributes are obtained, that book is added to a list.
            all_books.append(entry)

            # Prints the title of each book obtained.
            # print("Book Title:", full_book['title'])

        # Adds a key with a list that holds a dict for all the books and their
        # attributes.
        complete_list = {"books": all_books, "number": len(items)}

        return complete_list, HTTPStatus.OK
    else:
        # Call to Google Books not made.
        return {"empty": "none"}, HTTPStatus.BAD_REQUEST
