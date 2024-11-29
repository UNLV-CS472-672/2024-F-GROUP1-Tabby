from dataclasses import dataclass
import cv2
import numpy as np
from cv2.typing import MatLike

MAX_AREA = 400_000
"""Maximum area an image is allowed to have before using OCR on it."""


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

    @property
    def area(self) -> float:
        """Area that the bounding box takes up."""
        a = np.min(self.corners, axis=0)
        b = np.max(self.corners, axis=0)
        w, h = b - a
        return float(w * h)

    @property
    def center(self) -> np.ndarray:
        """Center of the bounding box."""
        return np.average(self.corners, axis=0)


class TextRecognizer:
    """Wrapper class to recognize text from images."""

    def __init__(self) -> None:
        """Creates a new TextRecognizer object."""
        import easyocr

        self._reader = easyocr.Reader(
            lang_list=["en"],
            model_storage_directory="./tabby_server/vision/EasyOCR",
        )

    def find_text(self, image: np.ndarray) -> list[RecognizedText]:
        """Finds text from the given image and returns the result.

        Args:
            image: Image to process.
        Returns:
            List of text recognized from the image.
        """

        results = self._find_text_one_way(image)
        return results

        # h, w, _ = image.shape

        # image0 = image
        # image90 = cv2.rotate(image0, cv2.ROTATE_90_COUNTERCLOCKWISE)
        # image180 = cv2.rotate(image0, cv2.ROTATE_180)
        # image270 = cv2.rotate(image0, cv2.ROTATE_90_CLOCKWISE)

        # results0 = self._find_text_one_way(image0)
        # results90 = self._find_text_one_way(image90)
        # results180 = self._find_text_one_way(image180)
        # results270 = self._find_text_one_way(image270)

        # Convert coordinates back to original image
        # for result in results270:
        #     for corner in result.corners:
        #         xp, yp = corner
        #         corner[0] = h - yp
        #         corner[1] = xp
        # for result in results180:
        #     for corner in result.corners:
        #         xp, yp = corner
        #         corner[0] = w - xp
        #         corner[1] = h - yp
        # for result in results90:
        #     for corner in result.corners:
        #         yp, xp = corner
        #         corner[0] = yp
        #         corner[1] = w - xp

        # return results0 + results90 + results180 + results270

    def _find_text_one_way(self, image: np.ndarray) -> list[RecognizedText]:
        """Finds text from the given image and returns the result. Only runs
        OCR once in one orientation.

        Args:
            image: Image to process.
        Returns:
            List of text recognized from the image.
        """
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


def scale_image(image: np.ndarray, max_area: int) -> tuple[np.ndarray, float]:
    """Scales the given image if it's too large.

    Args:
        image: Image to rescale.
        max_area: Maximum area the resulting image can have.
    Returns:
        Rescaled image if it's too large, otherwise the original image.
    """
    height, width, _ = image.shape
    area = height * width
    side_ratio = 1.0
    if area > max_area:  # If too large, scale it down
        area_ratio = max_area / area
        side_ratio = np.sqrt(area_ratio)
        new_height = int(side_ratio * height)
        new_width = int(side_ratio * width)
        image = cv2.resize(image, (new_height, new_width))
    return image, float(side_ratio)


# ai-gen start (ChatGPT-4o, 0)
def rotate_image(image: MatLike, angle: float, scale: float = 1.0) -> MatLike:
    """
    Rotates an image by a specified angle and scale.

    Parameters:
        image: Input image as a NumPy array or compatible Mat-like structure.
        angle: Angle to rotate the image (in degrees).
        scale: Scaling factor for the image (default is 1.0).

    Returns:
        The rotated image.
    """
    if image is None:
        raise ValueError("Input image is invalid or None.")

    # Define the center of rotation
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)

    # Get the rotation matrix
    M = cv2.getRotationMatrix2D(center, angle, scale)

    # Perform the rotation
    rotated_image = cv2.warpAffine(image, M, (w, h))

    return rotated_image


# ai-gen end
