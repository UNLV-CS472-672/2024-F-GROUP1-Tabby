# Setup the server
This guide will assume you have already have python and pip installed
on your computer! 😢

For some users, it may be possible to simply use 
`python3 -m tabby_server`
to start the server if dependences are already installed.
Otherwise...

### Install Poetry
We use Poetry as the package manager for this project. You can install it
[here](https://python-poetry.org/docs/#installation). I recommend installing
it using the **official installer**.

### Check that you have the right version
Make sure you have the right version of Python installed. We use
Python 3.12.

Mac/Linux
* `python3 --version`

Windows
* `python --version`

### Go into the server folder

Go into the server folder using `cd`.

```
cd server
```

### Ensure that you have a Virtual Environment.

Make sure you are in `server/`, NOT `server/tabby_server`.

Mac/Linux

```
python3 -m venv venv
```

Windows
```
python -m venv venv
```

This will create a folder called `venv/` which contain all of the dependencies
you can install locally.

### Activate the Virtual Environment

Mac/Linux
* `source venv/bin/activate`

Windows
* `./venv/Scripts/activate`

*** You will likely encounter stating windows cannot run scripts. 
You can remove it by doing this

`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`

Explanation: By default Windows disallows any scrips being ran (Restricted).
By using the command you are allowing only signed scripts from remote
and unsigned in local to run.

### Run the server

In the `server/` folder, do:

```
poetry install
```

This will install all of the dependencies, by reading `server/pyproject.toml`.

Now everything is setup, run it.

```
python -m tabby_server
```

## Disclaimer
Per Python's best practices, it is no longer encouraged to pip install
into your home computer. Instead, you must/should install all pip
packaged onto a virtual environment like venv. It is possible to
ignore this warning but we will be using venv for the server.

### TLDR, here is the video I followed...
This video goes through the entire process to setup the server as well
as the react app.

[Video](https://www.youtube.com/watch?v=7LNl2JlZKHA)


### Poe Scripts

Below are the scripts for Poe:

```bash
poe ci  # Runs the CI pipeline (lint, type, test)
poe dev  # Runs the development server.
poe format  # Formats all files in `tabby_server/` and `tests/`
poe lint  # Runs flake8 linter
poe test  # Runs unit tests
poe type  # Runs type checks using mypy
```

**Before committing/making a pull request, make sure you use `poe ci`!**

This will run the linter checks, type checker, and unit tests on your local
machine. This saves time from having Github Actions do the work through the
workflow.
