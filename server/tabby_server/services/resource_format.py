from __main__ import app
from http import HTTPStatus
import requests     # import requests (python -m pip install requests)
import json         # Unused in this. May be used later though. Default with Python I believe.

'''
Test bed to creating what may be returned by the GoogleBooks API.
Likely to be deleted later.
'''

# Outline of what a book class may be.

class TestBook:
    def __init__(title, author, summary, reviews, isbn, thumbnail):
        self.title = title
        self.author = author
        self.summary = summary
        self.reviews = reviews
        self.isbn = isbn
        self.thumbnail = thumbnail


# This call is an example given by Google Books documentation.
#   https://developers.google.com/books/docs/v1/using#request
# These are some Optional parameters.
#   https://developers.google.com/books/docs/v1/using#st_params

# To prevent unncessary call usage, I have copied the output of this query into .txt files.

api_key = ""    # Look in Discord for this. ------- NEEDED TO WORK -------
api_search = "flowers+inauthor:keyes"
api_results = "40" # 40 is the maximum. 10 is default. Won't allways return this many.
api_url = "https://www.googleapis.com/books/v1/volumes?q="+api_search+"&key="+api_key+"&maxResults="+api_results
# "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyBtLaFgVD8IuvZiR5JTZNAjXXjEhchI3sM&maxResults=40


# Empty for now. Will hold the result from google books.

output_dict = {}    # dict
output_list = []    # list

# Makes the request to google books if not already done.
# In actual code, this may come in the form of checking that
# search terms are different to prevent unncessary calling.

@app.route('/google_test_make_request', methods=['GET'])
def GoogleBooksTestCallAPI():
    if bool(output_dict):
        return "A call has already been made with these terms!", HTTPStatus.OK
    else:
        GoogleBooksTestRequestHardCoded()
        return "A call has just been made!", HTTPStatus.OK

# Does use a second function to make the actual call.
# Not entirely sure if this is appropriate for CRUD.
# But this API call does create data to be used.
# POST calls are also not allowed via URL. Hence this method.

#@app.route('/google_test_make_request', methods=['POST'])
def GoogleBooksTestRequestHardCoded():
    global output_dict
    global output_list
    response = requests.get(api_url)        # Makes a request to the Google Books API
    output_dict = response.json()           # Converts the output to a dict.
    output_list = output_dict.get('items')  # Gets the actual book results in the form of a list.


# Returns the output of the google books api call.
# Only works if a call has already been made.
# Calls are made with the GoogleBooksTestRequestHardCoded, not here.

@app.route('/google_test_all_results', methods=['GET'])
def GoogleBooksTestCallResults():
    if bool(output_dict):
        return output_dict, HTTPStatus.OK
    else:
        return "A call has not been made yet!", HTTPStatus.OK


# Returns the first results title.
# For test purposes, this should be "Flowers of Algernon".
# Only works if a call has already been made.

@app.route('/google_test_first_title', methods=['GET'])
def GoogleBooksTestFirstTitle():
    if bool(output_dict):
        temp_title = output_list[0].get('volumeInfo').get('title')  # This is one method of getting resources.
        # temp_title = output_list[0]["volumeInfo"]["title"]        # This is another. Both return the same thing.
        return temp_title, HTTPStatus.OK
    else:
        return "A call must be made for me to get a title!", HTTPStatus.OK


# Returns a list of all the titles of all the books received from
# Google Books. Only works if a call has been made.

@app.route('/google_test_all_titles', methods=['GET'])
def GoogleBooksTestCallAllTitles():
    if bool(output_dict):
        title_list = []
        for i in range(len(output_list)):
            book_title = output_list[i]["volumeInfo"]["title"]
            title_list.append(book_title)

            #print("Book Title:", book_title)
        return title_list, HTTPStatus.OK
    else:
        return "No titles to read!", HTTPStatus.OK

# https://chatgpt.com/share/670a045f-2d1c-800f-812f-d613d64a5781
# This chatGPT chat has shown that this method of attribution handling is, in fact, the
# best that can be done. Although it can be formatted to look a little nicer.