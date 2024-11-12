from ultralytics import YOLO
import json

"""
Enables You Only Look Once (YOLO) image recognition.

This will take in an image and scan it for books before outputting
a json with locations, bounding boxes, and confidence.

This is unroutable and onlt meant to be called by an endpoint.
"""


def find_books():
    """
    When called, it will retrieve a specific folder containing an image. That
    image should be a picture given to the backend from the frontend.

    This will then use YOLO to attempt to find any and all books within the
    image.

    Returns:
        A list of dicts for each book found.
        Each dict has the following traits:
            "box": Contains the bounding coordinates of the box.
            "class": Class number this object is. Can be safely ignored.
            "confidence": How confident the model is in the guess. 0 to 1.
            "name": Name of object. Always 'book' or 'books'
        the confidence the model has and the type of object it thinks it is.

        Example:
        [
            {
                "box": {
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
                },
                "class": 0,
                "confidence": 1,
                "name": "book"
            },
            {
                "box": {
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
                },
                "class": 0,
                "confidence": 1,
                "name": "book"
            }
        ]
    """

    # Load pretrained model. This assumes the model is directly adjacent to
    # this file.
    model = YOLO("shelf_yolo.pt")

    # Use model on given image path and return it.
    # Leaves behind no physical trace.
    output = model(
        source=(""),  # Retrieves image(s) from specific folder to look at.
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
