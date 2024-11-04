from typing import Optional
import cv2 as cv
import cyclopts as cy
from pprint import pprint

import numpy as np
from tabby_server.vision.ocr import TextRecognizer


app = cy.App()


def get_image_from_camera(camera_index: int) -> cv.typing.MatLike:
    while True:
        key = cv.waitKey(5) & 0xFF
        if key in ("q", "Q"):
            print("Exited program.")
            exit(0)


@app.default
def main(
    image_path: Optional[cy.types.ResolvedExistingFile] = None,
    camera_index: int = 0,
) -> None:
    """Command to find the text in the given image. If no image is given,
    then it'll poll a camera's feed."""

    if image_path is not None:
        image = cv.imread(str(image_path))
    else:
        image = get_image_from_camera(camera_index)

    height, width, _ = image.shape
    thickness = int(max(3, 0.005 * max(height, width)))

    recognizer = TextRecognizer()
    results = recognizer.find_text(image)
    texts = [r.text for r in results]
    print("Results:")
    pprint(results)
    print("Texts:")
    for text in texts:
        print(f"  {text!r}")

    display = image.copy()
    for result in results:
        a, _, b, _ = result.corners
        cv.rectangle(display, a, b, color=(0, 255, 0), thickness=thickness)
    print("Displaying image with bounding boxes... press any key to close.")

    cv.namedWindow("Display", cv.WINDOW_GUI_NORMAL)
    cv.imshow("Display", display)
    cv.waitKey()


if __name__ == "__main__":
    app()
