import logging
import os
from dotenv import load_dotenv
from openai import OpenAI
from openai.types.chat import ChatCompletion


# Load environmental variables from dotenv if they aren't already.
load_dotenv()

_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
"""Key to use the ChatGPT API."""

_MODEL = "gpt-4o"
"""ChatGPT Model to use."""

_ATTEMPT_MAX = 3
"""Maximum amount of attempts to poll ChatGPT for."""

_TAG_COUNT: int = 10
"""Number of tags to get from ChatGPT."""

SEPARATOR = "|---|"
"""Separator to use for the input message."""

_SYSTEM_MESSAGE: str = f"""\
You are a model which accepts a list of titles and authors. Using your knowledge of natural language and the internet, you will give a list of tags which generalizes the set of books. These tags will be used in a search query to find similar books.

In the input, you will accept 3 or more lines of text. Conditions:
- Each line is the format of "TITLE |---| AUTHOR |---| WEIGHT"
- Each weight is a number between 0 and 1.
- A weight of 0 means that related tags should NOT be included, while a weight of 10 means its tags should be heavily weighed.

You will output {_TAG_COUNT} tags, each on separate lines. Conditions:
- YOU MUST STRICTLY FOLLOW THIS FORMAT.
- Do not bulletpoint or number lines.
- These tags represent the best tags for the set.
- The best tags are first.
"""  # noqa: E501


def get_tags(
    titles: list[str], authors: list[str], weights: list[float]
) -> list[str]:
    """Generates a list of tags generalizing the given set of books.

    Args:
        titles: List of titles.
        authors: List with each element being an author or multiple authors
            separated by commas.
        weights: List of weights for each book.
    Returns:
        List of strings, representing each tag. Empty if failed.
    """

    # Create messages list to send as input
    input_message = get_input_message(titles, authors, weights)
    messages = [
        {"role": "system", "content": _SYSTEM_MESSAGE},
        {"role": "user", "content": input_message},
    ]

    # Attempt up to _ATTEMPT_MAX times to request from the API
    client = OpenAI(api_key=_OPENAI_API_KEY)
    tags: list[str] = []
    for i in range(1, _ATTEMPT_MAX + 1):

        # Request completion
        completion: ChatCompletion = client.chat.completions.create(
            model=_MODEL,
            messages=messages,  # type: ignore
        )

        # If no choices or response text given, try again
        if len(completion.choices) <= 0:
            logging.info(f"No choices from completion, attempt {i}")
            continue
        response = completion.choices[0].message.content
        if response is None:
            logging.info(f"No response, attempt {i}")
            continue

        # Extract tags
        tags = [
            t.strip() for t in response.splitlines() if t and not t.isspace()
        ]

        # Everything is successful, break loop
        logging.info(f"Success. Took {i} attempt(s).")
        break

    return tags


def get_input_message(
    titles: list[str], authors: list[str], weights: list[float]
) -> str:
    """Generates the ChatGPT input message for the list of books.

    Args:
        titles: List of titles.
        authors: List with each element being an author or multiple authors
            separated by commas.
        weights: List of weights for each book.
    Returns:
        Input message.
    """

    lines = []
    for t, a, w in zip(titles, authors, weights):
        lines.append(f"{t} {SEPARATOR} {a} {SEPARATOR} {w}")

    return "\n".join(lines)
