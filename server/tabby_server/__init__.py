from flask import Flask


def create_app_instance(name: str = "Tabby_Server"):
    return (Flask(name))


app = create_app_instance()
