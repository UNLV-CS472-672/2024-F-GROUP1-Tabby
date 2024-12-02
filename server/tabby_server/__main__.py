from tabby_server import app
import os


PORT = os.getenv("PORT", "8000")


if __name__ == "__main__":

    # Adapted from tutorial: https://flask.palletsprojects.com/en/stable/logging/  # noqa: E501
    app.run(debug=False, host="0.0.0.0", port=int(PORT))

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
