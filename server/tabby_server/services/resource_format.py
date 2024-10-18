from tabby_server.__main__ import app     # Use when running pytest
#from __main__ import app    # Use when actually running the server


from http import HTTPStatus
import requests
import os
from dotenv import load_dotenv, dotenv_values
load_dotenv()   # Use 'os.getenv("KEY")' to get values.

# Apparently necessary to import from a .env file?
# If there is a better way, do tell please.



'''
Test bed to creating what may be returned by the GoogleBooks API.
Likely to be deleted later.
'''


# This call is an example given by Google Books documentation.
#   https://developers.google.com/books/docs/v1/using#request
# These are some Optional parameters.
#   https://developers.google.com/books/docs/v1/using#st_params

# To prevent unncessary call usage, I have copied the output of this query into .txt files.



# Class variable to hold the result of the api call
class api_testing:
    # Empty for now. Will hold the result from google books.
    output_dict = {}    # dict

# Declares the class variable.
result_dict = api_testing()



# Makes the request to google books if not already done.
# In actual code, this may come in the form of checking that
# search terms are different to prevent unncessary calling.

@app.route('/test/make_request', methods=['GET'])
def GoogleBooksTestCallAPI():
    if not bool(result_dict.output_dict):
        # In reality, it would check if the search terms are exactly the same as before.
        # If they are, it would just call an easy return that was gotten previously.
        # Thus saving an API call and processing.

        api_key_var = "&key="           # Look in Discord for this. ------- NEEDED TO WORK -------
        api_key = os.getenv("API_KEY")  # Retrieve the API key
        api_http = "https://www.googleapis.com/books/v1/volumes?q=" # http set up
        api_search = "flowers+inauthor:keyes"   # Search terms
        api_max_var = "&maxResults="            # Max Var
        api_results = "40"                      # 40 is the maximum. 10 is default. Won't allways return this many.

        api_url = api_http+api_search+api_key_var+api_key+api_max_var+api_results

        response = requests.get(api_url)        # Makes a request to the Google Books API
        result_dict.output_dict = response.json()           # Converts the output to a dict.
                                                # Saves to global variable so other functions can access it
        
    # Returns the complete output of the API call.
    return result_dict.output_dict, HTTPStatus.OK




# This grabs some settings of the books entered found from Google Books.
# This has a check to skip a book if the isbn does not exist.
# All information is in a try_except because not all results have the
# necessary variables to return.

@app.route('/test/all_books', methods=['GET'])
def GoogleBooksTestAllBooks():
    # Gets the actual book results in the form of a list.
    output_list = []
    try:
        output_list = result_dict.output_dict["items"]
    except KeyError:
        pass

    if bool(output_list):
        # List that holds all the dicts for each book.
        all_books = []

        for i in range(len(output_list)):
            # Dict to hold the individual book attributes
            full_book = {}

            try:
                full_book['isbn'] = output_list[i]["volumeInfo"]["industryIdentifiers"]
            except KeyError:
                continue

            try:
                full_book['title'] = output_list[i]["volumeInfo"]["title"]
            except KeyError:
                pass

            try:
                full_book['author'] = output_list[i]["volumeInfo"]["authors"]
            except KeyError:
                pass

            try:
                full_book['summary'] = output_list[i]["volumeInfo"]["description"]
            except KeyError:
                pass

            try:
                full_book['publisher'] = output_list[i]["volumeInfo"]["publisher"]
            except KeyError:
                pass

            try:
                full_book['reviews'] = output_list[i]["volumeInfo"]["averageRating"]
            except KeyError:
                pass

            try:
                full_book['thumbnail'] = output_list[i]["volumeInfo"]["imageLinks"]
            except KeyError:
                pass

            # Once the attributes are obtained, that book is added to a list.
            all_books.append(full_book)

            # Prints the title of each book obtained.
            #print("Book Title:", full_book['title'])

        # Adds a key with a list that holds a dict for all the books and their attributes.
        complete_list = { "books" : all_books , "number" : len(output_list)}

        return complete_list, HTTPStatus.OK
    else:
        # Call to Google Books not made.
        return {"empty" : "none"}, HTTPStatus.BAD_REQUEST

