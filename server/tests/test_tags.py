from typing import Any, Callable
from unittest.mock import Mock

import pytest
from tabby_server.services.tags import SEPARATOR, get_input_message, get_tags
from tabby_server.services.google_books import Book


sample_books: list[Book] = [
    Book(
        isbn="9780139798092",
        title="Thinking in C++",
        authors="Bruce Eckel",
        rating="4.5",
        summary="CD-ROM contains: basic introductory seminar on the C concepts "
        "necessary to understand C++ or Java.",
        thumbnail="http://books.google.com/books/content?id=dSzHnI1QGywC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        page_count="834",
        genres="Computers",
        publisher="Pearson",
        published_date="2000",
    ),
    Book(
        isbn="9780131225527",
        title="Thinking in C++.",
        authors="Bruce Eckel,Chuck Allison",
        rating="5",
        summary="For undergraduate level courses in Advanced C++ Programming "
        "offered in Computer Science departments. This text streamlines "
        "the process of learning the C++ language, presenting material a "
        "simple step at a time, which allows the reader to digest each "
        "concept before moving on, and provides them with a solid "
        "foundation in C++.",
        thumbnail="http://books.google.com/books/content?id=P_9iQgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        page_count="806",
        genres="C&& (Computer program language)",
        publisher="",
        published_date="2004",
    ),
    Book(
        isbn="9788129710703",
        title="Thinking In C++ Volume - 2: Practical Programming",
        authors="Eckel",
        rating="",
        summary="",
        thumbnail="",
        page_count="0",
        genres="",
        publisher="",
        published_date="",
    ),
    Book(
        isbn="9780139798092",
        title="Thinking in C++",
        authors="Bruce Eckel",
        rating="4.5",
        summary="CD-ROM contains: basic introductory seminar on the C concepts "
        "necessary to understand C++ or Java.",
        thumbnail="http://books.google.com/books/content?id=dSzHnI1QGywC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        page_count="834",
        genres="Computers",
        publisher="Pearson",
        published_date="2000",
    ),
    Book(
        isbn="9780981872551",
        title="Atomic Kotlin",
        authors="Bruce Eckel,Svetlana Isakova",
        rating="",
        summary="For both beginning and experienced programmers! From the author "
        "of the multi-award-winning Thinking in C++ and Thinking in Java "
        "together with a member of the Kotlin language team comes a book "
        'that breaks the concepts into small, easy-to-digest "atoms," '
        "along with exercises supported by hints and solutions directly "
        "inside IntelliJ IDEA! No programming background necessary. "
        "Summaries for experienced programmers. Easy steps via very "
        'small chapters ("atoms"). Free accompanying exercises/solutions '
        "within IntelliJ Idea. Gives you a strong Kotlin foundation. "
        "Kotlin is cleaner, more consistent and far more powerful than "
        "Java. Increase programming productivity with Kotlin's clear, "
        "concise syntax. Produce safer, more reliable programs. Kotlin "
        "easily interacts with Java. Effortlessly migrate by adding "
        "pieces of Kotlin to an existing Java project. Support for "
        "Windows, Mac and Linux. Free version of Intellij IDEA includes "
        "extensive Kotlin support. Book resources, live seminars, "
        "workshops and consulting available at AtomicKotlin.com.",
        thumbnail="http://books.google.com/books/content?id=U8MkzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        page_count="636",
        genres="",
        publisher="",
        published_date="2021-01-11",
    ),
    Book(
        isbn="9780078815225",
        title="Using C++",
        authors="Bruce Eckel",
        rating="",
        summary="",
        thumbnail="http://books.google.com/books/content?id=m3_oCNnuf4IC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        page_count="646",
        genres="Computers",
        publisher="Osborne Publishing",
        published_date="1989",
    ),
    Book(
        isbn="9781484257135",
        title="C++20 Recipes",
        authors="J. Burton Browning,Bruce Sutherland",
        rating="",
        summary="Discover the newest major features of C++20, including modules, "
        "concepts, spaceship operators, and smart pointers. This book is "
        "a handy code cookbook reference guide that covers the C++ core "
        "language standard as well as some of the code templates "
        "available in standard template library (STL). In C++20 Recipes: "
        "A Problem-Solution Approach, you'll find numbers, strings, "
        "dates, times, classes, exceptions, streams, flows, pointers, "
        "and more. Also, you'll see various code samples, templates for "
        "C++ algorithms, parallel processing, multithreading, and "
        "numerical processes. It also includes 3D graphics programming "
        "code. A wealth of STL templates on function objects, adapters, "
        "allocators, and extensions are also available. This is a "
        "must-have, contemporary reference for your technical library to "
        "help with just about any project that involves the C++ "
        "programming language. What You Will Learn See what's new in "
        "C++20 Write modules Work with text, numbers, and classes Use "
        "the containers and algorithms available in the standard library "
        "Work with templates, memory, concurrency, networking, "
        "scripting, and more Code for 3D graphics Who This Book Is For "
        "Programmers with at least some prior experience with C++.",
        thumbnail="http://books.google.com/books/content?id=et7eDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        page_count="645",
        genres="Computers",
        publisher="Apress",
        published_date="2020-04-24",
    ),
    Book(
        isbn="9781558513341",
        title="Black Belt C++",
        authors="Bruce Eckel",
        rating="",
        summary="Drawing on the best of the Software Development Conference, the "
        "prestigious conference that focuses on the art and science of "
        "developing computer programs, this book brings together works "
        "written by the gurus of the C++ programming language. It offers "
        "software developers understanding and guidance on the "
        "development and use of the C++ language that they won't find "
        "anywhere else.",
        thumbnail="",
        page_count="345",
        genres="Computers",
        publisher="M&T Press",
        published_date="1994",
    ),
]


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
    assert get_tags(sample_books) == []

    # Test no message content
    mock_completion.choices.append(Mock())
    mock_completion.choices[0].message = Mock()
    mock_completion.choices[0].message.content = None
    assert get_tags(sample_books) == []

    # Test success
    expected_tags = [f"tag{i}" for i in range(1, 11)]
    successful_output = "\n".join(expected_tags)
    mock_completion.choices[0].message.content = successful_output
    assert get_tags(sample_books) == expected_tags


def test_get_input_message() -> None:
    """Tests get_input_message()"""
    input_message = get_input_message(sample_books)
    lines = input_message.splitlines()
    assert len(lines) == len(sample_books)
    for line in lines:
        assert SEPARATOR in line
