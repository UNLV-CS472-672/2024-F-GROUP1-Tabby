# Use an official Python image from Docker Hub
FROM python:3.12-slim

# Install system dependencies including OpenCV's required libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (the official way)
RUN curl -sSL https://install.python-poetry.org | python3 -

# Add Poetry to the PATH
ENV PATH="/root/.local/bin:$PATH"

# Set working directory for the container
WORKDIR /app

# Copy the poetry configuration files (pyproject.toml and poetry.lock)
COPY pyproject.toml poetry.lock* /app/

# Install Python dependencies
RUN poetry install --no-interaction --only main

# Copy your app code
COPY . /app

# Set the command to run your application
CMD ["gunicorn", "-b", ":$PORT", "tabby_server:app"]
