"""Module to extract title and author from OCR results."""

from dataclasses import dataclass
import os
import re
from typing import Optional
from dotenv import load_dotenv
from openai.types.chat import ChatCompletion

from openai import OpenAI
from tabby_server.vision.ocr import RecognizedText

load_dotenv()

_OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
_MODEL = "gpt-4o"
_ATTEMPT_MAX = 3
_ANSWER_COUNT = 5
_SEPERATOR = "|---|"

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
- Each answer is in the format of "TITLE |---| AUTHOR |---| CONFIDENCE". YOU MUST STRICTLY OBEY THIS FORMAT. Do not number or bulletpoint each answer.
- Each answer is unique.
- Every character should be UPPERCASE.
- Confidence is a proportion from 0.0 to 1.0, which represents how likely the answer is actually correct.
- The first answer is your most confident answer, while the bottom answer is your least confident answer.
- More confident answers should include the volume.
- More confident answers should include the edition.

Finally, you must output a separate line after your answers a message explaining your choices for your answers. Conditions:
- This must be in the format of "Explanation: <EXPLANATION MESSAGE>"
"""


@dataclass
class ExtractionOption:
    """Represents a single option (out of several) which could be correct."""

    title: str
    """Extracted title."""

    author: str
    """Extracted author."""

    confidence: float
    """Proportion in [0, 1] representing how likely that it matches the
    answer. Note: This proportion is only an estimate and not based on any
    mathematical backing."""


@dataclass
class ExtractionResult:
    """Represents an extraction result."""

    options: list[ExtractionOption]
    """List of options from most confident to least confident."""

    explanation: str
    """Explanation of the given options. Empty if not specified."""


def extract_from_recognized_texts(
    recognized_texts: list[RecognizedText],
) -> Optional[ExtractionResult]:
    input_message = "\n".join(
        f"{r.text} |---| {r.area} |---| {r.center[0]}, {r.center[1]}"
        for r in recognized_texts
    )

    messages = [
        {"role": "system", "content": _SYSTEM_MESSAGE},
        {"role": "user", "content": input_message},
    ]

    client = OpenAI(api_key=_OPENAI_API_KEY)
    success: bool = False
    result: ExtractionResult
    for _ in range(_ATTEMPT_MAX):

        completion: ChatCompletion = client.chat.completions.create(
            model=_MODEL,
            messages=messages,  # type: ignore
            api_key=_OPENAI_API_KEY,
        )
        if len(completion.choices) <= 0:
            continue

        response = completion.choices[0].message.content
        if response is None:
            continue

        extracted_result = extract_result(response)
        if extracted_result is None:
            continue

        result = extracted_result
        success = True
        break

    if not success:
        return None

    return result


def extract_option(answer: str) -> Optional[ExtractionOption]:
    """Attempts to extract an `ExtractionObject` object from an answer.

    Args:
        answer: Answer line to extract from.
    Returns:
        `ExtractionOption` object if valid string, `None` if invalid.
    """

    # Split into three parts
    parts = answer.strip().split(_SEPERATOR)
    if len(parts) != 3:
        return None

    title, author, confidence_str = parts
    title = title.strip()
    author = author.strip()
    confidence_str = confidence_str.strip()

    # Attempt to convert confidence into a float
    try:
        confidence = float(confidence_str)
    except ValueError:
        return None

    # Create and return object
    return ExtractionOption(
        title=title,
        author=author,
        confidence=confidence,
    )


def extract_result(response: str) -> Optional[ExtractionResult]:
    """Attempts to extracts an `ExtractionResult` object from a response
    object.

    Args:
        response: Text of the response from ChatGPT.
    Returns:
        `ExtractionResult` object if valid, `None` if invalid.
    """

    # Split into lines
    lines = response.strip().splitlines()

    # Split into answers and explanation. Last line is explanation; the rest
    # are answers
    *answers, explanation = lines
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
    return ExtractionResult(options=options, explanation=explanation)
