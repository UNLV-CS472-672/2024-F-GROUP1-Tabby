"""Tests vision/extraction.py."""

from typing import Optional
import pytest

from tabby_server.vision.extraction import (
    ExtractionOption,
    ExtractionResult,
    extract_option,
    extract_result,
)


test_extract_option_cases: list[tuple[str, Optional[ExtractionOption]]] = [
    ("", None),
    ("        ", None),
    ("The Time Machine by H.G. Wells", None),
    ("The Time Machine by H.G. Wells, 0.75", None),
    ("The Time Machine |---| H.G. Wells", None),
    ("The Time Machine |---| H.G. Wells, 0.75", None),
    ("The Time Machine |---| H.G. Wells |---| 0.75 |---| 0.5", None),
    (
        "The Time Machine |---| H.G. Wells |---| 0.75",
        ExtractionOption(
            title="The Time Machine", author="H.G. Wells", confidence=0.75
        ),
    ),
    (
        "A Christmas Carol |---| Charles Dickens |---| 0.5",
        ExtractionOption(
            title="A Christmas Carol", author="Charles Dickens", confidence=0.5
        ),
    ),
    (
        "Treasure Island |---| Robert Louis Stevenson |---| 0.25",
        ExtractionOption(
            title="Treasure Island",
            author="Robert Louis Stevenson",
            confidence=0.25,
        ),
    ),
]


@pytest.mark.parametrize(("answer", "result"), test_extract_option_cases)
def test_extract_option(
    answer: str, result: Optional[ExtractionResult]
) -> None:
    """Tests extract_option()."""
    assert extract_option(answer) == result


# Case 0: Success
case0_string = """
A |---| ALICE |---| 0.95
B |---| ALICE |---| 0.8
C |---| ALICE |---| 0.75
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65

Explanation: So basically...
"""
case0_result = ExtractionResult(
    options=[
        ExtractionOption(title="A", author="ALICE", confidence=0.95),
        ExtractionOption(title="B", author="ALICE", confidence=0.8),
        ExtractionOption(title="C", author="ALICE", confidence=0.75),
        ExtractionOption(title="D", author="ALICE", confidence=0.7),
        ExtractionOption(title="E", author="ALICE", confidence=0.65),
    ],
    explanation="Explanation: So basically...",
)

# Case 1: Success
case1_string = """
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.95
KICKING AWAY THE LADDER |---| HA-JOON CHANG |---| 0.85
DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.80
KICKING AWAY THE LADDER: IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.75
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY |---| HA-JOON CHANG |---| 0.70

Explanation: The main title identified ...
"""
case1_result = ExtractionResult(
    options=[
        ExtractionOption(
            title="KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE",
            author="HA-JOON CHANG",
            confidence=0.95,
        ),
        ExtractionOption(
            title="KICKING AWAY THE LADDER",
            author="HA-JOON CHANG",
            confidence=0.85,
        ),
        ExtractionOption(
            title="DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE",
            author="HA-JOON CHANG",
            confidence=0.80,
        ),
        ExtractionOption(
            title="KICKING AWAY THE LADDER: IN HISTORICAL PERSPECTIVE",
            author="HA-JOON CHANG",
            confidence=0.75,
        ),
        ExtractionOption(
            title="KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY",
            author="HA-JOON CHANG",
            confidence=0.70,
        ),
    ],
    explanation="Explanation: The main title identified ...",
)

# Case 2: Fail because too few options
case2_string = """
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.95

Explanation: The main title identified ...
"""
case2_result = None

# Case 3: Fail because too many options
case3_string = """
A |---| ALICE |---| 0.95
B |---| ALICE |---| 0.8
C |---| ALICE |---| 0.75
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65
F |---| ALICE |---| 0.5

Explanation: So basically...
"""
case3_result = None

# Case 4: Fail because one line has too many arguments
case4_string = """
A |---| ALICE |---| 0.95 |---| what
B |---| ALICE |---| 0.8
C |---| ALICE |---| 0.75
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65

Explanation: So basically...
"""
case4_result = None

# Case 5: Fail because confidence is not convertable
case5_string = """
A |---| ALICE |---| 0.95
B |---| ALICE |---| 0.8
C |---| ALICE |---| 75%
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65

Explanation: So basically...
"""
case5_result = None

test_extract_result_cases: list[tuple[str, Optional[ExtractionResult]]] = [
    (case0_string, case0_result),
    (case1_string, case1_result),
    (case2_string, case2_result),
    (case3_string, case3_result),
    (case4_string, case4_result),
    (case5_string, case5_result),
]


@pytest.mark.parametrize(("response", "result"), test_extract_result_cases)
def test_extract_result(response: str, result: Optional[ExtractionResult]):
    assert extract_result(response) == result
