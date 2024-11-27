from typing import Any, Callable
from unittest.mock import Mock

import pytest
from tabby_server.services.tags import get_tags

sample_titles: list[str] = [
    "To Kill a Mockingbird",
    "The Giver",
    "Nineteen Eighty-Four",
]
sample_authors: list[str] = ["Harper Lee", "Lois Lowry", "George Orwell"]
sample_tags: list[float] = [0.3, 0.5, 0.7]


@pytest.fixture(scope="function")
def mock_chat_completion() -> Callable[[Any], None]:
    """Fixture to mock the result of a chat completion."""

    import openai.resources.chat

    result = None

    def mock_create(self, **kwargs) -> Any:
        return result

    openai.resources.chat.Completions.create = mock_create  # type: ignore

    def set_result(new_result: Any) -> None:
        nonlocal result
        result = new_result

    return set_result


def test_get_tags(mock_chat_completion) -> None:
    """Tests get_tags()"""

    mock_completion = Mock()

    mock_chat_completion(mock_completion)

    # Test no choices
    mock_completion.choices = []
    assert get_tags(sample_titles, sample_authors, sample_tags) == []

    # Test no message content
    mock_completion.choices.append(Mock())
    mock_completion.choices[0].message = Mock()
    mock_completion.choices[0].message.content = None
    assert get_tags(sample_titles, sample_authors, sample_tags) == []

    # Test success
    expected_tags = [f"tag{i}" for i in range(1, 11)]
    successful_output = "\n".join(expected_tags)
    mock_completion.choices[0].message.content = successful_output
    assert (
        get_tags(sample_titles, sample_authors, sample_tags) == expected_tags
    )
