import torch
import json
import cv2


def test_find_books():
    """
    Sends fake tensor image matrices to the yolo function.

    Sorts through bad matrices. Returns output of a good matrix image.
    """

    # Import function
    from tabby_server.vision.image_labelling import find_books

    # No Arguments
    result = find_books()
    assert result is not None and "no_image" in result[0]

    # Generate Incorrect Tensor Images

    # ai-gen start (ChatGPT-4.0, 2)

    # Incorrect Number of Dimensions
    # Omits batch dimension.
    bad_image = torch.rand(3, 640, 640)
    result = find_books(bad_image)
    assert result is not None and "bad_tensor" in result[0]

    # Incorrect Number of Channels.
    bad_image = torch.rand(1, 1, 640, 640)
    result = find_books(bad_image)
    assert result is not None and "bad_tensor" in result[0]

    # Incorrect Image Shape.
    bad_image = torch.rand(1, 3, 700, 500)
    result = find_books(bad_image)
    assert result is not None and "bad_tensor" in result[0]

    # Incorrect dtype.
    bad_image = torch.randint(0, 256, (1, 3, 640, 640), dtype=torch.uint8)
    result = find_books(bad_image)
    assert result is not None and "bad_tensor" in result[0]

    # Incorrect Normalization.
    bad_image = bad_image.float()
    result = find_books(bad_image)
    assert result is not None and "bad_tensor" in result[0]

    # ai-gen end

    # Converts Example Image into Tensor Format
    good_image = cv2.imread("tests/yolo_example.jpg")
    good_image = cv2.cvtColor(good_image, cv2.COLOR_BGR2RGB)
    good_image = cv2.resize(good_image, (640, 640))
    good_image = good_image / 255.0
    good_image = (
        torch.from_numpy(good_image).float().permute(2, 0, 1).unsqueeze(0)
    )

    # Loads Example Image Output
    with open("tests/yolo_example_output.json", "r") as f:
        test_output = json.load(f)

    # Tests Example Image
    result = find_books(good_image)
    assert (
        result[0] is not None
        and result[0]["confidence"] == test_output[0]["confidence"]
    )
