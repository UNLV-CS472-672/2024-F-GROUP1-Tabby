import base64


def image_decoder(string64: str, fileName: str, path: str = "./") -> None:
    """ Function will attempt to decript a provided
        base 64 string into an image.

    :param string64: Base 64 string. Function will not check to see if it is
        actually a base 64 string
    :param fileName: Name the file of the decripted image.
        '.png' is appended to the end of this name in the function.
    :param path: Optional, provide a path to create the image.
        Otherwise, it will be created where ever it was called.

    Note: Be careful if an execption is thrown in this function.
        It is possible that it created an image at the specified path
        if it encounters an unhandled exception.
    """
    # Just type checking here
    if not isinstance(string64, str):
        raise TypeError(f"Expected string64 of type string, "
                        f"instead got {type(string64).__name__}")

    if not isinstance(fileName, str):
        raise TypeError(f"Expected fileName of type string, "
                        f"instead got {type(fileName).__name__}")

    if not isinstance(path, str):
        raise TypeError(f"Expected path of type string, "
                        f"instead got {type(path).__name__}")
    # End of type checking

    # Create file header with these parameters.
    with open(f"{path}{fileName}.png", "wb") as fh:
        # Parse the base64 string into an image.
        # Ensure that it's type is byte and not a string
        fh.write(base64.decodebytes(bytes(string64, 'utf-8')))

    return      # Function, END
