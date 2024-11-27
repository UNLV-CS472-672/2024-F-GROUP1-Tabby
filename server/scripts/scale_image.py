from typing import Annotated
import cyclopts as cy
import cv2 as cv
from tabby_server.vision import ocr

app = cy.App()


@app.default
def main(
    image_path: cy.types.ResolvedExistingFile,
    /,
    *,
    max_area: int = ocr.MAX_AREA,
) -> None:
    """Rescales the given image so that its size falls below a certain max
    area.

    Args:
        image_path: Path to the image to use.
        max_area: Maximum pixels the rescaled image will contain.
    """

    image = cv.imread(str(image_path))

    h, w, _ = image.shape
    area = h * w
    print(f"Image dimensions: {w}x{h}")
    print(f"Image area: {area}")
    print("Showing original image... press any key to close.")
    cv.namedWindow("Display", cv.WINDOW_GUI_NORMAL)
    cv.imshow("Display", image)
    cv.waitKey()

    image = ocr.scale_image(image, max_area)
    print("--RESCALE--")

    h, w, _ = image.shape
    area = h * w
    print(f"Image dimensions: {w}x{h}")
    print(f"Image area: {area}")
    print("Showing rescaled image... press any key to close.")
    cv.namedWindow("Display", cv.WINDOW_GUI_NORMAL)
    cv.imshow("Display", image)
    cv.waitKey()


if __name__ == "__main__":
    app()
