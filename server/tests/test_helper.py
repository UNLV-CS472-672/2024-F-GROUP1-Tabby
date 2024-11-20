import tabby_server.api.base64_to_image as base64_to_image
from tests.variable import test_base64


def test_image_decoding():
    # Attempt to decript an image and check for it's existance
    img = base64_to_image.decode_image(test_base64)

    # Check the top left pixel to see if it is this exact color
    assert (img[0, 0] == [208, 192, 169]).all()


if __name__ == "__main__":
    test_image_decoding()
