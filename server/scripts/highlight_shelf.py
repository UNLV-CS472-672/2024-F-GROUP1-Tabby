from pprint import pprint
import cyclopts as cy
from PIL import Image
import cv2 as cv
import numpy as np
import torch

from tabby_server.vision import image_labelling
from tabby_server.api.books import scan_shelf


app = cy.App()

@app.default
def main(image_path: cy.types.ResolvedExistingFile) -> None:
    """Highlights the books on the given image of a shelf.
    
    Args:
        image_path: Path to an image of a shelf.
    """

    image = cv.imread(str(image_path))
    h, w, _ = image.shape

    image_processed = cv.resize(image, (640, 640))
    image_processed = image_processed / 255.0
    image_tensor = torch.from_numpy(image_processed).float().permute(2, 0, 1).unsqueeze(0)

    results = image_labelling.find_books(image_tensor)

    pprint(results)

    display = image.copy()
    for result in results:
        x1 = int(result['box']['x1'] / 640.0 * w)
        x2 = int(result['box']['x2'] / 640.0 * w)
        y1 = int(result['box']['y1'] / 640.0 * h)
        y2 = int(result['box']['y2'] / 640.0 * h)

        display = cv.rectangle(display, (x1, y1), (x2, y2), (0, 255, 0), 5)

    cv.namedWindow('Display', cv.WINDOW_NORMAL)
    cv.imshow('Display', display)
    cv.waitKey()


if __name__ == '__main__':
    app()
