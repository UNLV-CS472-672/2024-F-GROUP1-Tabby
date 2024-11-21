from flask import Blueprint
from http import HTTPStatus
from ultralytics import YOLO
import json


# Blueprint for this file. Adds the 'test' prefix in __main__.py.
# To call functions in this file use "/test/<function_route>"
yolo_test = Blueprint("yolo_test", __name__)


"""
This file is a testbed implementation of You Only Look Once (YOLO) image
recognition. Credits at the bottom.
"""


# Instantiates the model.
# Runs it. Outputs files to vision/example_yolo.
# https://docs.ultralytics.com/modes/predict/#working-with-results


def ultralytics_shelf_detection(file_path) -> dict[str, list]:
    # Load pretrained model.
    model = YOLO(file_path + "shelf_yolo.pt")

    # ai-gen start (ChatGPT-4.0, 1)

    import cv2

    # Reads image as a NumPy array
    image = cv2.imread(file_path + "example_shelves/shelf_2.jpg")
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # Resize to model's expected input
    resized_image = cv2.resize(image_rgb, (640, 640))
    # Normalize pixel values
    normalized_image = resized_image / 255.0
    import torch

    tensor_image = (
        torch.from_numpy(normalized_image)
        .float()
        .permute(2, 0, 1)
        .unsqueeze(0)
    )

    # ai-gen end

    # Use model on given image url and return it.
    # Outputs the resulting image to vision/example_yolo.
    output = model(
        # What it images it looks at
        # source=(file_path + "example_shelves"),
        # source=(file_path + "example_shelves/shelf_8.jpg"),
        source=tensor_image,
        # Minimum accepted conf
        conf=0.45,
        # Saves output to separate files
        # Saves full image with context
        # .txt with written data
        # Cropped images of each box
        # save=True,
        # save_txt=True,
        save_conf=True,
        # save_crop=True,
        # What objects it looks for
        classes=[0],
        # Where it saves the output files (images and text)
        project=("../example_yolo"),
        # Show image in debug window
        # show=True,
    )

    # output is a list of Results.
    # More can be read here: https://docs.ultralytics.com/modes/predict/#videos

    # This loops through each Result and converts its output to a json which is
    # converted to a dict. This is then added to a global dict which is
    # returned and printed.

    # This lists each object found by the model including:
    #   class type (in this case it is only looking for class 'books'),
    #   confidence,
    #   name of object (copies name of class from what I can tell),
    #   and the bounding shape (boxes only for this model)

    inc = 1
    found = {}
    for item in output:
        found["shelf_" + str(inc)] = json.loads(item.to_json())
        inc = inc + 1

    return found

    # found = []
    # for item in output:
    #     found.append(json.loads(item.to_json()))
    # return found
    # return json.loads(output[0].to_json())


# Callable.
# Calls the model for each example file in vision/example_shelves.


@yolo_test.route("/shelf_read", methods=["GET"])
def predict_examples():
    # Runs model on each image file in vision/example_shelves.
    # This is to prevent issues with pytest and main.
    try:
        objects = ultralytics_shelf_detection("tabby_server/vision/")
    except FileNotFoundError:
        objects = ultralytics_shelf_detection("")

    # Returns the output of the model
    return (
        objects,
        HTTPStatus.OK,
    )


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
