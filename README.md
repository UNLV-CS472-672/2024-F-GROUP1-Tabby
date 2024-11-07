# 2024-F-GROUP1-Tabby

App capable of reading text off of an image of a book and provide recomendations,
and user compatability for that particular book.

`app/` is for the front-end mobile application, and `server/` is for the
back-end server.

## Installing App

For .env, use 
`NODE_ENV=test npx expo start --tunnel`
so that it can read the env file in the first place.

TODO write documentation

## Installing Server

```
cd server
python -m venv venv  # Must be with Python 3.12
./venv/scripts/activate  # Activate environment
poetry install
```
