import base64
import cv2
import io
import numpy as np
from PIL import Image


""" Example Useage
    import tabby_server.api.base64_to_image as base64_to_image
    from PIL import Image

    img - base64_to_image(base64String)
    # Print the image matrix
    print(img)

    # Convert matrix into an image
    img = Image.fromarray(img, 'RGB')

    # Display image
    img.show()
"""


def decode_image(string64: str) -> np.ndarray:
    """ Function will attempt to decript a provided \
        base 64 string into an image matrix.

    :param string64: Base 64 string. Function will not check to see if it is
        actually a base 64 string
    """
    # First decode the base64 into byte data
    imgdata = base64.decodebytes(bytes(string64, "utf-8"))

    # Process the byte data into BGR (Blue, Gree, Red) where
    # blue occupies the most significant bit and red occupies the LSB
    img = Image.open(io.BytesIO(imgdata))

    # Don't convert image from BRG into RGB
    # Just read as is
    opencv_img = cv2.cvtColor(np.array(img), cv2.IMREAD_COLOR)

    return opencv_img  # Function, END
