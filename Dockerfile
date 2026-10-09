# Stage 1: Build the React frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Since it was built for Electron, we might need to ensure base URL is correct.
# Vite default is / which is correct for our StaticFiles mount.
RUN npm run build

# Stage 2: Setup the Python Backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies (e.g., for OpenCV or other ML libraries if needed)
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY ai_service/requirements.txt ./ai_service/
RUN pip install --no-cache-dir -r ai_service/requirements.txt

# Copy the frontend build artifacts to the location main.py expects
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy the backend code
COPY ai_service/ /app/ai_service/

# Expose the standard Hugging Face port
EXPOSE 7860

# Run the FastAPI server on port 7860 (Hugging Face default)
WORKDIR /app/ai_service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
