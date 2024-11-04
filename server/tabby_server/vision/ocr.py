import cv2 as cv
from dataclasses import dataclass
from functools import cache
import easyocr
import numpy as np


@dataclass(kw_only=True)
class RecognizedText:
    """Dataclass which represents some text in an image."""

    text: str
    """The text recognized from the image."""

    corners: np.ndarray
    """4x2 matrix of points which represents the corners of the bounds of the
    recognized text."""

    confidence: float
    """Float from 0 to 1 representing how confident that the text matches the
    image."""


class TextRecognizer:
    """Wrapper class to recognize text from images."""

    def __init__(self) -> None:
        """Creates a new TextRecognizer object."""
        self._reader = easyocr.Reader(lang_list=["en"])

    def find_text(self, image: np.ndarray) -> list[RecognizedText]:
        """Finds text from the given image and returns the result."""
        ocr_results = self._reader.readtext(image)
        my_results: list[RecognizedText] = []
        for points, text, confidence in ocr_results:
            my_results.append(
                RecognizedText(
                    text=text,
                    corners=np.array(points, dtype=np.int32),
                    confidence=float(confidence),
                )
            )
        return my_results


# Not used yet but will be used in a future pull
def scale_image(image: np.ndarray, max_area: int) -> np.ndarray:
    """Scales the given image if it's too large."""
    height, width, _ = image.shape
    area = height * width
    if area > max_area:
        area_ratio = max_area / area
        side_ratio = np.sqrt(area_ratio)
        new_height = int(side_ratio * height)
        new_width = int(side_ratio * width)
        image = cv.resize(image, (new_height, new_width))
    return image
