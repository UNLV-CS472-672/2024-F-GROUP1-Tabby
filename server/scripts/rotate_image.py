import logging
import sys
from typing import Literal
import cv2 as cv
import cyclopts as cy
from pprint import pprint

from tabby_server.vision.ocr import rotate_image


app = cy.App()


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
    angle_in_deg: Literal[0, 90, 180, 270],
) -> None:
    """Rotates the given image by either 90, 180, or 270 degrees.
    Args:
        image_path: Image
    """
    image = cv.imread(str(image_path))

    if angle_in_deg == 0:
        image = image
    elif angle_in_deg == 90:
        image = cv.rotate(image, cv.ROTATE_90_COUNTERCLOCKWISE)
    elif angle_in_deg == 180:
        image = cv.rotate(image, cv.ROTATE_180)
    else:  # 270
        image = cv.rotate(image, cv.ROTATE_90_CLOCKWISE)

    # cv.namedWindow('Display', cv.WINDOW_NORMAL)
    cv.imshow("Display", image)
    cv.waitKey()


if __name__ == "__main__":
    app()
