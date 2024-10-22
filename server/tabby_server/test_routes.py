from http import HTTPStatus
# from tabby_server.__main__ import app     # Use when running pytest
# from __main__ import app    # Use when actually running the server



def alternate_page():
    return 'it works!', HTTPStatus.OK


# This is a test format to creating a new page on the local server.
# This mainly works by importing the main object and being imported by
# __main__.py as well.

# While this would be very bad if we were do doing a large app.
# For this small scale, this should be sufficient.
