# Setup the server
This guide will assume you have already have python and pip installed
on your computer! 😢

For some users, it may be possible to simply use 
`python3 -m tabby_server`
to start the server if dependences are already installed.
Otherwise...

### Ensure that you have a venv
Go into the `/../server/tabby_server` location.
If a venv folder already exist, skip this step. If not,

Mac/Linux
* `python3 -m venv venv`

Windows
* `python -m venv venv`

### Now enter the venv environment

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
You should now be in the venv environment. From there ensure Flask is installed.

`pip3 install Flask`

Now everything is setup, run it.

`python3 __main__.py`

## Disclaimer
Per Python's best practices, it is no longer encouraged to pip install
into your home computer. Instead, you must/should install all pip
packaged onto a virtual environment like venv. It is possible to
ignore this warning but we will be using venv for the server.

### TLDR, here is the video I followed...
This video goes through the entire process to setup the server as well
as the react app.

[Video](https://www.youtube.com/watch?v=7LNl2JlZKHA)
