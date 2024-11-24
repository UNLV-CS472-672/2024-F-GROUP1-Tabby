# # Initial build for dependencies
# FROM python:3.12-slim

# Initial build for dependencies
FROM python:3.12-slim AS build

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

# Install system dependencies including OpenCV's required libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    freeglut3-dev \
    libgtk2.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry using pip
RUN pip install --no-cache-dir poetry

# Set working directory for the container
WORKDIR /app

# Copy the poetry configuration files (pyproject.toml and poetry.lock)
COPY pyproject.toml poetry.lock* /app/

# Install Python dependencies
RUN poetry install --no-interaction --only main

# Final build for production app
FROM python:3.12-slim

# Install system dependencies including OpenCV's required libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    freeglut3-dev \
    libgtk2.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependencies from build stage
COPY --from=build /app /app

# Copy app code to image
COPY ./ /app

# Expose port to Flask
EXPOSE 8000

# Set the command to run your application
CMD ["gunicorn", "-b", ":8000", "tabby_server:app"]
