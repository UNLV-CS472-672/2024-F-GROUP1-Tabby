import cv2 as cv

from tabby_server.vision.ocr import TextRecognizer


def test_finding_text():
    """Tests TextRecognizer"""

    image = cv.imread("tests/img/easyocr.png")

    recognizer = TextRecognizer()
    results = recognizer.find_text(image)

    assert any(r.text.lower() == "easyocr" for r in results)
