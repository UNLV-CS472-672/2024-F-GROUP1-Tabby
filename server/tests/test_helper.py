import tabby_server.services.helper as helper
from tests.variable import test_base64
import os
import unittest


class Helper (unittest.TestCase):
    def test_image_decoding(self):
        fName = "tempImage"
        pPath = "./"

        # Error: base64 should be of type string
        with self.assertRaises(TypeError):
            helper.image_decoder(64, "FileName Here...")

        # Error: FileName shoudl be of type string
        with self.assertRaises(TypeError):
            helper.image_decoder("Base64 string Here...", 44)

        # Error: Path, if specified, must be of type string
        with self.assertRaises(TypeError):
            helper.image_decoder("Base64", "File", 66)

        # Attempt to decript an image and check for it's existance
        helper.image_decoder(test_base64, fName, pPath)
        assert os.path.isfile(f"{pPath}{fName}.png")

        # Remove the image after the test
        os.remove(f"{pPath}{fName}.png")


if __name__ == "__main__":
    Helper().test_image_decoding()
