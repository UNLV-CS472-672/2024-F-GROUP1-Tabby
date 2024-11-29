import time
from typing import Annotated, Literal
import cv2 as cv
import cyclopts as cy
from pprint import pprint

import numpy as np
from tabby_server.vision.ocr import TextRecognizer


app = cy.App()


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
    rotate: Literal[0, 90, 180, 270] = 0,
    /,
    *,
    strict: Annotated[bool, cy.Parameter(("-s", "--strict"))] = False,
) -> None:
    """Finds the text in the given image and displays it to the screen.

    Args:
        image_path: Path to the image to scan.
        strict: If true, prints each text in a strict format. Good for testing
            with the ChatGPT module.
        rotate: Number of degrees to rotate the image CLOCKWISE before sending
            it to be processed.
    """

    image_original = cv.imread(str(image_path))
    if rotate == 0:
        image = image_original.copy()
    elif rotate == 90:
        image = cv.rotate(image_original, cv.ROTATE_90_CLOCKWISE)
    elif rotate == 180:
        image = cv.rotate(image_original, cv.ROTATE_180)
    else:  # 270
        image = cv.rotate(image_original, cv.ROTATE_90_COUNTERCLOCKWISE)

    h, w, _ = image_original.shape
    thickness = int(max(3, 0.005 * max(h, w)))

    recognizer = TextRecognizer()

    start = time.time()
    results = recognizer.find_text(image)
    duration = time.time() - start

    # Readjust points
    if rotate == 0:
        f = lambda xp, yp: [xp, yp]
    elif rotate == 90:
        f = lambda xp, yp: [yp, h - xp]
    elif rotate == 180:
        f = lambda xp, yp: [w - xp, h - yp]
    elif rotate == 270:
        f = lambda xp, yp: [w - yp, xp]
    for result in results:
        new_corners = [f(xp, yp) for xp, yp in result.corners]
        result.corners = np.array(new_corners)

    texts = [r.text for r in results]

    if strict:
        for result in results:
            cx, cy = result.center
            print(f"{result.text} |---| {result.area} |---| {cx}, {cy}")
        return

    print("Results:")
    pprint(results)
    print("Texts:")
    for text in texts:
        print(f"  {text!r}")

    display = image_original.copy()
    for result in results:
        a, _, b, _ = result.corners
        cv.rectangle(display, a, b, color=(0, 255, 0), thickness=thickness)

    print(f"Duration: {duration:6.2f}s")

    print("Displaying image with bounding boxes... press any key to close.")

    cv.namedWindow("Display", cv.WINDOW_GUI_NORMAL)
    cv.imshow("Display", display)
    cv.waitKey()


if __name__ == "__main__":
    app()
