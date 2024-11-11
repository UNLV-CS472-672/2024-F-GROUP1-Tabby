"""Tests vision/extraction.py."""

from typing import Any, Callable, Optional
import numpy as np
import pytest
from unittest.mock import Mock

from tabby_server.vision.extraction import (
    ExtractionOption,
    ExtractionResult,
    extract_from_recognized_texts,
    extract_option,
    extract_result,
)
from tabby_server.vision.ocr import RecognizedText


@pytest.fixture(scope="function")
def mock_chat_completion() -> Callable[[Any], None]:
    import openai.resources.chat

    result = None

    def mock_create(self, **kwargs) -> Any:
        return result

    openai.resources.chat.Completions.create = mock_create  # type: ignore

    def set_result(new_result: Any) -> None:
        nonlocal result
        result = new_result

    return set_result


def test_extract_from_recognized_texts(mock_chat_completion):

    array = np.array
    int32 = np.int32
    recognized_texts = [
        RecognizedText(
            text="Yhe",
            corners=array(
                [[1287, 1149], [1430, 1149], [1430, 1241], [1287, 1241]],
                dtype=int32,
            ),
            confidence=0.9687318815241893,
        ),
        RecognizedText(
            text="GIVER",
            corners=array(
                [[1063, 1136], [1903, 1136], [1903, 1452], [1063, 1452]],
                dtype=int32,
            ),
            confidence=0.5087589255096184,
        ),
        RecognizedText(
            text="LOIS LOWRY",
            corners=array(
                [[1093, 1475], [1529, 1475], [1529, 1580], [1093, 1580]],
                dtype=int32,
            ),
            confidence=0.9996451656642958,
        ),
        RecognizedText(
            text="WBERY",
            corners=array(
                [[1217, 1599], [1381, 1599], [1381, 1652], [1217, 1652]],
                dtype=int32,
            ),
            confidence=0.6144646080385431,
        ),
        RecognizedText(
            text="FoR",
            corners=array(
                [[1246, 1725], [1289, 1725], [1289, 1742], [1246, 1742]],
                dtype=int32,
            ),
            confidence=0.256911000952944,
        ),
        RecognizedText(
            text="Kost",
            corners=array(
                [[1189, 1740], [1245, 1740], [1245, 1761], [1189, 1761]],
                dtype=int32,
            ),
            confidence=0.4908447563648224,
        ),
        RecognizedText(
            text="GuIsKed",
            corners=array(
                [[1312, 1734], [1399, 1734], [1399, 1755], [1312, 1755]],
                dtype=int32,
            ),
            confidence=0.12960127064526247,
        ),
        RecognizedText(
            text="conTRiBUTION",
            corners=array(
                [[1222, 1746], [1376, 1746], [1376, 1779], [1222, 1779]],
                dtype=int32,
            ),
            confidence=0.2260517510779616,
        ),
        RecognizedText(
            text="AMERICAN TETERATURE",
            corners=array(
                [[1187, 1770], [1407, 1770], [1407, 1811], [1187, 1811]],
                dtype=int32,
            ),
            confidence=0.31583082693196934,
        ),
        RecognizedText(
            text="Foa",
            corners=array(
                [[1224, 1807], [1267, 1807], [1267, 1824], [1224, 1824]],
                dtype=int32,
            ),
            confidence=0.44165945695392195,
        ),
        RecognizedText(
            text="CHILOREN",
            corners=array(
                [[1272, 1794], [1373, 1794], [1373, 1827], [1272, 1827]],
                dtype=int32,
            ),
            confidence=0.42015955448817516,
        ),
        RecognizedText(
            text="CNE",
            corners=array(
                [[1140, 1661], [1215, 1612], [1238, 1653], [1162, 1702]],
                dtype=int32,
            ),
            confidence=0.42075591895723286,
        ),
        RecognizedText(
            text="F88718",
            corners=array(
                [[1245, 1724], [1338, 1717], [1339, 1755], [1247, 1762]],
                dtype=int32,
            ),
            confidence=0.07274339039611395,
        ),
    ]

    mock_completion = Mock()

    mock_chat_completion(mock_completion)

    # Test no choices
    mock_completion.choices = []
    assert extract_from_recognized_texts(recognized_texts) is None

    # Test no message content
    mock_completion.choices.append(Mock())
    mock_completion.choices[0].message = Mock()
    mock_completion.choices[0].message.content = None
    assert extract_from_recognized_texts(recognized_texts) is None

    # Test each input text and result
    for input_text, result in test_extract_result_cases:
        mock_completion.choices[0].message.content = input_text
        if result is None:
            assert extract_from_recognized_texts(recognized_texts) is None
        else:
            assert extract_from_recognized_texts(recognized_texts) == result


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
"""
case0_result = ExtractionResult(
    options=[
        ExtractionOption(title="A", author="ALICE", confidence=0.95),
        ExtractionOption(title="B", author="ALICE", confidence=0.8),
        ExtractionOption(title="C", author="ALICE", confidence=0.75),
        ExtractionOption(title="D", author="ALICE", confidence=0.7),
        ExtractionOption(title="E", author="ALICE", confidence=0.65),
    ],
)

# Case 1: Success
case1_string = """
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.95
KICKING AWAY THE LADDER |---| HA-JOON CHANG |---| 0.85
DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.80
KICKING AWAY THE LADDER: IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.75
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY |---| HA-JOON CHANG |---| 0.70
"""  # noqa: E501

case1_result = ExtractionResult(
    options=[
        ExtractionOption(
            title="KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE",  # noqa: E501
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
)

# Case 2: Fail because too few options
case2_string = """
KICKING AWAY THE LADDER: DEVELOPMENT STRATEGY IN HISTORICAL PERSPECTIVE |---| HA-JOON CHANG |---| 0.95
"""  # noqa: E501
case2_result = None

# Case 3: Fail because too many options
case3_string = """
A |---| ALICE |---| 0.95
B |---| ALICE |---| 0.8
C |---| ALICE |---| 0.75
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65
F |---| ALICE |---| 0.5
"""
case3_result = None

# Case 4: Fail because one line has too many arguments
case4_string = """
A |---| ALICE |---| 0.95 |---| what
B |---| ALICE |---| 0.8
C |---| ALICE |---| 0.75
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65
"""
case4_result = None

# Case 5: Fail because confidence is not convertable
case5_string = """
A |---| ALICE |---| 0.95
B |---| ALICE |---| 0.8
C |---| ALICE |---| 75%
D |---| ALICE |---| 0.7
E |---| ALICE |---| 0.65
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


@pytest.mark.parametrize(
    ("response", "result"),
    test_extract_result_cases,
    ids=range(len(test_extract_result_cases)),
)
def test_extract_result(response: str, result: Optional[ExtractionResult]):
    """Tests extract_result()"""
    assert extract_result(response) == result
