#import logging
import pytest

from http import HTTPStatus

from tabby_server.__main__ import app     # Use when running pytest
#from __main__ import app    # Use when actually running the server

from tabby_server.services.resource_format import result_dict
import requests_mock
#from flask.testing import FlaskClient

import os
from dotenv import load_dotenv, dotenv_values
load_dotenv()



@pytest.fixture()
def client():
    return app.test_client()

@pytest.mark.usefixtures("client")
class TestAPIEndPoint:

    def test_first_funct(self, client):
        # Test Test
        result = client.get('/members')

        assert result.status_code == HTTPStatus.OK

    def test_test(self, client):
        result = client.post('/api/test')

        assert result.status_code == HTTPStatus.OK



    # Makes a call to Google Books API
    def test_GoogleBooksTestCallAPI(self, client):
        with requests_mock.Mocker() as m:
            local_api = os.getenv("API_KEY")
            m.get("https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=" + local_api +"&maxResults=40", json={"books": [ 0 , 1 ] })
            #requests.get('http://test.com').text
            
            # First Call - Should pass. Just calls the Google APU.
            result = client.get('/test/make_request')

            # Should be a successful search.
            assert result.status_code == HTTPStatus.OK
            assert "books" in result.json


    # Returns a dict with a key for a list which itself holds
    # a dict for each book returned.
    def test_GoogleBooksTestAllBooks(self, client):
        # First Call - Should fail. No books.
        result = client.get("/test/all_books")

        # No prior search was made. No data to return.
        assert result.status_code == HTTPStatus.BAD_REQUEST
        assert "empty" in result.json

        # Second Call - Should pass. List of books.
        # This time makes an API call prior.
        
        
        result_dict.output_dict = {"items" : [ {"volumeInfo" : {"industryIdentifiers" : 1} } , {"volumeInfo" : {"industryIdentifiers" : 2} } ] }
        result = client.get("/test/all_books")

        # Returns a json with book attributes.
        assert result.status_code == HTTPStatus.OK
        assert "books" in result.json