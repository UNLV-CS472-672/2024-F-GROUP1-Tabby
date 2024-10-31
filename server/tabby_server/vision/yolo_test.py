from flask import Blueprint, request
from http import HTTPStatus
from ultralytics import YOLO


# Blueprint for this file. Adds the 'test' prefix in __main__.py.
# To call functions in this file use "/test/<function_route>"
yolo_test = Blueprint('yolo_test', __name__)


'''
This file is a testbed implementation of You Only Look Once (YOLO) image
recognition. Credits at the bottom.
'''


# Instantiates the model.
# Runs it. Outputs files to vision/example_yolo.

def ultralytics_shelf_detection(file_path, save_output):
    # Load pretrained model.
    model = YOLO(file_path+"shelf_yolo.pt")

    # Use model on given image url and return it.
    # Outputs the resulting image to vision/example_yolo.
    model(source=(file_path+"example_shelves"),
          conf=0.45, save=save_output,
          project=(file_path+"example_yolo"))


# Callable.
# Calls the model for each example file in vision/example_shelves.
# Doesn't return anything of value to HTTP.
# Use parameter index to indicate if you want to save the output or not.

@yolo_test.route('/shelf_read', methods=["GET"])
def predict_examples():
    # Get parameter index.
    # 1 means you want to save (default). 0 means you don't.
    # Index only exists so we don't save output files from pytest
    index = int(request.args.get("index", 1))

    # Error check to see if the index is okay or not.
    if index > 1 or index < 0:
        return ({"Incorrect": "Please give 0, 1, or nothing"},
                HTTPStatus.BAD_REQUEST)

    # Runs model on each image file in vision/example_shelves.
    # This is to prevent issues with pytest and main.
    try:
        ultralytics_shelf_detection("tabby_server/vision/", bool(index))
    except FileNotFoundError:
        ultralytics_shelf_detection("", bool(index))

    # Generic return to HTTP.
    # Eventually might make it return the images. Might be to much work though.
    return ({"Detected": "Go to vision/example_yolo for results"},
            HTTPStatus.OK)


'''
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
'''
