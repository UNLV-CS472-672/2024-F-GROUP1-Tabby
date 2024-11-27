import cv2 as cv

import numpy as np
from tabby_server.vision.ocr import TextRecognizer, scale_image


def test_finding_text():
    """Tests TextRecognizer"""

    image = cv.imread("tests/img/easyocr.png")

    recognizer = TextRecognizer()
    results = recognizer.find_text(image)

    assert any(r.text.lower() == "easyocr" for r in results)
    for r in results:
        assert r.area > 0
        assert r.center.shape == (2,)


def test_scale_image() -> None:
    """Tests scale_image()"""

    image = np.zeros((1000, 1000, 3))  # 1_000_000 pixels

    image, k = scale_image(image, 5000)  # scale down to below 5000 pixels
    w, h, _ = image.shape
    assert w * h <= 5000
