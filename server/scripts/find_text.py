import cv2 as cv
import cyclopts as cy
from pprint import pprint

from tabby_server.vision.ocr import TextRecognizer


app = cy.App(usage="Usage: [b]find_text IMAGE-PATH[/b]\n")


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
    /,
) -> None:
    """Finds the text in the given image and displays it to the screen.

    Args:
        image_path: Path to the image to scan.
    """

    image = cv.imread(str(image_path))

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
