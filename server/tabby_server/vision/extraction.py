"""Module to extract title and author from OCR results."""

from dataclasses import dataclass
import os
from typing import Optional
from dotenv import load_dotenv
from openai.types.chat import ChatCompletion
import logging

from openai import OpenAI
from tabby_server.vision.ocr import RecognizedText

# Load environmental variables from dotenv if they aren't already.
load_dotenv()

_OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
"""Key to use the ChatGPT API."""

_MODEL = "gpt-4o"
"""ChatGPT Model to use."""

_ATTEMPT_MAX = 3
"""Maximum amount of attempts to poll ChatGPT for."""

_ANSWER_COUNT = 5
"""Number of answers to get from ChatGPT."""

_SEPERATOR = "|---|"
"""Separator for input and output messages."""

_SYSTEM_MESSAGE = f"""\
You are a model which accepts chunks of text which were recognized by an OCR model. The texts will be from the cover of a physical book. Using your knowledge of natural language and the internet, you will identify (1) the title and (2) the author, given the text.

In the input, you will accept 1 or more lines of text. Conditions:
- Each line is in the format of "TEXT |---| AREA |---| CENTER_X, CENTER_Y"
- TEXT is the text recognized by the OCR model.
- There may be misspellings in the text, for which you must account for.
- There may be parts of text which do are not part of the title nor the author.
- AREA is a floating point value representing how much area the text takes up.
- Texts with larger area tend to be part of the title or author.
- CENTER_X, CENTER_Y are floating point values which represent the center point of the text's bounding box.
- Texts which have close centers may be a part of a larger chunk.

You will output {_ANSWER_COUNT} answers on separate lines. Conditions:
- Each answer is in the format of "TITLE |---| AUTHOR". YOU MUST STRICTLY OBEY THIS FORMAT. Do not number or bulletpoint each answer.
- Each answer is unique.
- Every character should be UPPERCASE.
- The first answer is your most confident answer, while the bottom answer is your least confident answer.
- More confident answers should include the volume.
- More confident answers should include the edition.
"""  # noqa: E501

#
# Used to be part of system message:
#
# Finally, you must output a separate line after your answers a message explaining your choices for your answers. Conditions:  # noqa: E501
# - This must be in the format of "Explanation: <EXPLANATION MESSAGE>"
#
# This was removed as it made ChatGPT take more time to generate a response to
# this.
#


@dataclass
class ExtractionOption:
    """Represents a single option (out of several) which could be correct."""

    title: str
    """Extracted title."""

    author: str
    """Extracted author."""


@dataclass
class ExtractionResult:
    """Represents an extraction result."""

    options: list[ExtractionOption]
    """List of options from most confident to least confident."""

    # explanation: str
    # """Explanation of the given options. Empty if not specified."""


def extract_from_recognized_texts(
    recognized_texts: list[RecognizedText],
) -> Optional[ExtractionResult]:
    """Attempts to extract a result from the recognized texts."""

    # Create messages list to send as input
    input_message = "\n".join(
        f"{r.text} {_SEPERATOR} {r.area} {_SEPERATOR} {r.center[0]}, {r.center[1]}"  # noqa: E501
        for r in recognized_texts
    )
    messages = [
        {"role": "system", "content": _SYSTEM_MESSAGE},
        {"role": "user", "content": input_message},
    ]

    # Attempt up to _ATTEMPT_MAX times to request from the API
    client = OpenAI(api_key=_OPENAI_API_KEY)
    success: bool = False
    result: ExtractionResult
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

        # If no extracted_result successfully extracted, try again
        extracted_result = extract_result(response)
        if extracted_result is None:
            logging.info(f"Invalid format of response, attempt {i}")
            continue

        # Everything is successful, break loop
        logging.info(f"Success. Took {i} attempt(s).")
        result = extracted_result
        success = True
        break

    if not success:
        return None

    return result


def extract_option(answer: str) -> Optional[ExtractionOption]:
    """Attempts to extract an option from an answer.

    Args:
        answer: Answer line to extract from.
    Returns:
        `ExtractionOption` object if valid string, `None` if invalid.
    """

    # Split into three parts
    parts = answer.strip().split(_SEPERATOR)
    if len(parts) != 2:
        return None

    title, author = parts
    title = title.strip()
    author = author.strip()

    # Create and return object
    return ExtractionOption(
        title=title,
        author=author,
    )


def extract_result(response: str) -> Optional[ExtractionResult]:
    """Attempts to extracts a result from a response object.

    Args:
        response: Text of the response from ChatGPT.
    Returns:
        `ExtractionResult` object if valid, `None` if invalid.
    """

    # Split into lines
    answers = response.strip().splitlines()

    # Filter answers
    answers = [a for a in answers if a and not a.isspace()]
    if len(answers) != _ANSWER_COUNT:
        return None

    # Extract values into option objects
    options: list[ExtractionOption] = []
    for answer in answers:
        option = extract_option(answer)
        if option is None:  # Invalid format, return None
            return None
        options.append(option)
    return ExtractionResult(options=options)
