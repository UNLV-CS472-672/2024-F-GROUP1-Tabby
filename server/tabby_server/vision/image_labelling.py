from contextlib import contextmanager
from ultralytics import YOLO
import torch
import json
import os

"""
Enables You Only Look Once (YOLO) image recognition.

This will take in an image and scan it for books before outputting
a json with locations, bounding boxes, and confidence.

This is unroutable and onlt meant to be called by an endpoint.
"""


@contextmanager
def temp_dir(path):
    """
    Context Manages to allow temporarily changing the working directory to
    match the given path.

    Ensures that the original path is restored even if the change fails or if
    an exception occurs when this is in use.

    Primarily to allow directly calling to this function for testing purposes.
    """

    original_dir = os.getcwd()
    try:
        os.chdir(path)
        yield
    finally:
        os.chdir(original_dir)


# Expected Image Size for Model to Use
EXPECTED_SIZE = (640, 640)

# Temporarily Change Working Directory
with temp_dir("tabby_server/vision/"):
    # Load pretrained model from other directory.
    model = YOLO("shelf_yolo.pt")


def find_books(tensor_image=None) -> list[dict[str, list]]:
    """
    When called, it will be given a tensor image matrix. It will verify that it
    is compatible with the yolo model before working.

    Once verified, The model will then scan the image matrix for books. The
    model uses segmentation, meaning it will attempt to 'cut' out the object
    it finds rather than attempting to use general bounding boxes.

    It will then return a json containing a list that holds the data for each
    book found by the model.

    Returns:
        A list of dicts for each book found.
        Each dict has the following traits:
            "box": Contains the bounding coordinates of the box.
            "class": Class number this object is. Can be safely ignored.
            "confidence": How confident the model is in the guess. 0 to 1.
            "name": Name of object. Always 'book' or 'books'
        the confidence the model has and the type of object it thinks it is.

        If an error/issue is found, it will instead return an error dict.

        Example:
        [
            {
            "box": {
                "x1": x1,
                "x2": x2,
                "y1": y1,
                "y2": y2
            },
            "class": 0,
            "confidence": 0-1,
            "name": "book",
            "segments": {
                "x": [
                x_1,
                x_2
                ],
                "y": [
                y_1,
                y_2
                ]
            }
            },
            {
            "box": {
                "x1": x1,
                "x2": x2,
                "y1": y1,
                "y2": y2
            },
            "class": 0,
            "confidence": 0-1,
            "name": "book",
            "segments": {
                "x": [
                x_1,
                x_2
                ],
                "y": [
                y_1,
                y_2
                ]
            }
            }
        ]
    """

    # Quickly check that an image was provided.
    # If not, return nothing.
    if tensor_image is None:
        return [{"no_image": [0]}]

    # These are a series of verifications to ensure the tensor image is
    # compatible with yolo.

    # ai-gen start (ChatGPT-4.0, 2)

    # First Check:
    #   Verifies the tensor has 4-dimensions.
    #       batch_size[0]       : # of images (should be 1)
    #       channels[1]         : # of color channels (should be 3)
    #       height[2], width[3] : image dimensions (should be 640, 640)
    # Second Check:
    #   Verifies the tensor has 3 color channels.
    #       Should be RGB, not BGR.
    # Third Check:
    #   Verifies the image is in 640x640 format.
    #       This is what the model was trained at.
    # Fourth Check:
    #   Verifies the tensor is in float32.
    # Fifth Check:
    #   Verifies the tensor has been normalized.
    if not (
        tensor_image.ndim == 4
        and tensor_image.shape[1] == 3
        and tensor_image.shape[2:] == EXPECTED_SIZE
        and tensor_image.dtype == torch.float32
        and tensor_image.max() <= 1.0
        and tensor_image.min() >= 0.0
    ):
        return [{"bad_tensor": [1]}]
    # tensor_image = tensor_image.float()   # Converts tensor to float32.
    # tensor_image = tensor_image / 255.0   # Normalizes tensor image.

    # ai-gen end

    # Use model on given image path and return it.
    # Leaves behind no physical trace.
    output = model(
        source=tensor_image,  # Given image matrix
        conf=0.45,  # Minimum accepted confidence
        save_conf=True,  # Save Confidence to output
        classes=[0],  # What objects it looks for
    )

    # This is temp code that may be needed later to output multiple classes
    # from the object. For example, if one layer was "book" and another was
    # "books" we may need this instead.
    # found = []
    # for item in output:
    #     found.append(json.loads(item.to_json()))

    # Converts the first part of output (which contains only the boxes for
    # books in a list) into a json object to be returned.
    return json.loads(output[0].to_json())


"""
Ultralytics Credits
@software{yolo11_ultralytics,
  author = {Glenn Jocher and Jing Qiu},
  title = {Ultralytics YOLO11},
  version = {11.0.0},
  year = {2024},
  url = {https://github.com/ultralytics/ultralytics},
  orcid = {0000-0001-5950-6979, 0000-0002-7603-6750, 0000-0003-3783-7069},
  license = {AGPL-3.0}
}
"""
