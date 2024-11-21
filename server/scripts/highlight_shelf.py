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
def main(image_path: cy.types.ResolvedExistingFile, *, show_each: bool = False) -> None:
    """Highlights the books on the given image of a shelf.
    
    Args:
        image_path: Path to an image of a shelf.
        show_each: If given, shows each book individually before showing the entire picture.
    """

    image = cv.imread(str(image_path))
    h, w, _ = image.shape

    print(f"{image.shape = }")

    image_processed = cv.resize(image, (640, 640))
    image_processed = image_processed / 255.0
    image_tensor = torch.from_numpy(image_processed).float().permute(2, 0, 1).unsqueeze(0)

    results = image_labelling.find_books(image_tensor)

    # pprint(results)

    cv.namedWindow('Display', cv.WINDOW_NORMAL)

    display = image.copy()
    for result in results:

        # scale results to the original image
        x1 = int(result['box']['x1'] / 640.0 * w)
        x2 = int(result['box']['x2'] / 640.0 * w)
        y1 = int(result['box']['y1'] / 640.0 * h)
        y2 = int(result['box']['y2'] / 640.0 * h)
        
        # ensure coords are in range
        x1 = min(max(x1, 0), w - 1)
        x2 = min(max(x2, 0), w - 1)
        y1 = min(max(y1, 0), h - 1)
        y2 = min(max(y2, 0), h - 1)

        # ensure x1 < x2 and y1 < y2
        x1, x2 = min(x1, x2), max(x1, x2)
        y1, y2 = min(y1, y2), max(y1, y2)

        print(f"Subimage Corners: {(x1, y1)}, {(x2, y2)}")

        display = cv.rectangle(display, (x1, y1), (x2, y2), (0, 255, 0), 5)

        if show_each:
            subimage = image[y1:y2, x1:x2, :]
            print(f"{subimage.shape = }")
            if np.all(subimage.shape):  # if no dimension is 0, display it
                cv.imshow('Subimage', subimage)
                cv.waitKey()
            else:
                print("subimage has 0 length in one dimension, skipping...")

    cv.imshow('Display', display)
    cv.waitKey()


if __name__ == '__main__':
    app()
