from typing import cast
from unittest.mock import Mock
import cv2 as cv

import easyocr
import numpy as np
from tabby_server.vision.ocr import TextRecognizer, scale_image


def test_init():
    """Tests TextRecognizer object creation."""
    recognizer = TextRecognizer()  # works without crashing

    mock_reader = Mock()
    mock_reader.readtext.return_value = []
    recognizer = TextRecognizer(mock_reader)
    image = np.zeros((640, 640, 3))
    assert recognizer.find_text(image) == []


def test_finding_text_real():
    """Tests finding text on a real image"""

    image = cv.imread("tests/img/easyocr.png")

    recognizer = TextRecognizer()
    results = recognizer.find_text(image)

    assert any(r.text.lower() == "easyocr" for r in results)
    for r in results:
        assert r.area > 0
        assert r.center.shape == (2,)


def test_finding_text_mock():
    """Tests finding text with mock results"""

    image = np.zeros((100, 100, 3))

    mock_reader = Mock()
    mock_reader.readtext.return_value = [
        (
            [
                [50.0, 50.0],
                [50.0, 100.0],
                [100.0, 100.0],
                [100.0, 50.0],
            ],
            "some text",
            0.9,
        )
    ]

    recognizer = TextRecognizer(mock_reader)

    # 0 degrees
    results = recognizer.find_text(image)
    assert len(results) == 1
    assert (
        results[0].corners
        == [
            [50.0, 50.0],
            [50.0, 100.0],
            [100.0, 100.0],
            [100.0, 50.0],
        ]
    ).all()

    # 90 clockwise
    results = recognizer.find_text(image, 90)
    assert len(results) == 1
    assert (
        results[0].corners
        == [
            [50.0, 50.0],
            [100.0, 50.0],
            [100.0, 0.0],
            [50.0, 0.0],
        ]
    ).all()

    # 180 degrees
    results = recognizer.find_text(image, 180)
    assert len(results) == 1
    assert (
        results[0].corners
        == [
            [50.0, 50.0],
            [50.0, 0.0],
            [0.0, 0.0],
            [0.0, 50.0],
        ]
    ).all()

    # 270 degree clockwise
    results = recognizer.find_text(image, 270)
    assert len(results) == 1
    assert (
        results[0].corners
        == [
            [50.0, 50.0],
            [0.0, 50.0],
            [0.0, 100.0],
            [50.0, 100.0],
        ]
    ).all()


def test_scale_image() -> None:
    """Tests scale_image()"""

    image = np.zeros((1000, 1000, 3))  # 1_000_000 pixels

    image, k = scale_image(image, 5000)  # scale down to below 5000 pixels
    w, h, _ = image.shape
    assert w * h <= 5000
