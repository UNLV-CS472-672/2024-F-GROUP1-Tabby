from tabby_server import app
import os
from logging.config import dictConfig


PORT = os.getenv("PORT", "8000")


if __name__ == "__main__":

    # Adapted from tutorial: https://flask.palletsprojects.com/en/stable/logging/  # noqa: E501
    dictConfig(
        {
            "version": 1,
            "formatters": {
                "default": {
                    "format": "[%(asctime)s] (%(levelname)s) %(module)s: %(message)s",  # noqa: E501
                }
            },
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://flask.logging.wsgi_errors_stream",
                    "formatter": "default",
                }
            },
            "root": {"level": "INFO", "handlers": ["wsgi"]},
        }
    )

    app.run(debug=False, host="0.0.0.0", port=int(PORT))

# Run by using
# python3 server.py
# HTML Module: https://docs.python.org/3/library/http.html
# Backend Guide: https://www.youtube.com/watch?v=7LNl2JlZKHA
