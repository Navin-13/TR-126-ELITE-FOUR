# Use the official lightweight Python image
FROM python:3.12-slim

# Allow statements and log messages to immediately appear in the console
ENV PYTHONUNBUFFERED True

# Copy local code to the container image
WORKDIR /app
COPY . .

# Install dependencies from backend directory
RUN pip install --no-cache-dir -r backend/requirements.txt

# Cloud Run injects $PORT automatically, but we set a default just in case
ENV PORT 8080
EXPOSE 8080

# Move execution context to backend so paths inside app.py resolve cleanly
WORKDIR /app/backend

# Run the web service on container startup using gunicorn
# 1 worker and 8 threads is well-optimized for lightweight API hosting
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
