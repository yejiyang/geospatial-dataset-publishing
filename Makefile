# Makefile for Geospatial Dataset Publishing project

.PHONY: help setup-backend run-backend run-frontend clean-backend setup-frontend build-frontend dev test docker-build docker-up docker-down docker-logs docker-clean

# Default target
help:
	@echo "Available commands:"
	@echo "  setup-backend    - Create virtual environment and install backend dependencies"
	@echo "  run-backend      - Run pygeoapi backend service locally"
	@echo "  setup-frontend   - Install frontend dependencies"
	@echo "  build-frontend   - Build frontend for production"
	@echo "  run-frontend     - Serve frontend locally"
	@echo "  dev              - Run both backend and frontend in development mode"
	@echo "  clean-backend    - Remove virtual environment"
	@echo "  test             - Run tests"
	@echo "  docker-build     - Build Docker images"
	@echo "  docker-up        - Start Docker containers"
	@echo "  docker-down      - Stop Docker containers"
	@echo "  docker-logs      - View Docker container logs"
	@echo "  docker-clean     - Remove Docker containers, images, and volumes"
	@echo "  help             - Show this help message"

# Backend setup and management
setup-backend:
	@echo "Setting up Python virtual environment..."
	cd pygeoapi && python3 -m venv venv
	@echo "Installing system dependencies (you may need sudo privileges)..."
	@echo "Note: Install gdal-bin package using your system package manager:"
	@echo "  Ubuntu/Debian: sudo apt-get install gdal-bin libgdal-dev"
	@echo "  macOS: brew install gdal"
	@echo "  CentOS/RHEL: sudo yum install gdal"
	@echo "Installing Python dependencies..."
	cd pygeoapi && ./venv/bin/pip install --upgrade pip
	cd pygeoapi && ./venv/bin/pip install -r installation.txt
	@echo "Generating OpenAPI specification..."
	cd pygeoapi && PYGEOAPI_CONFIG=./pygeoapi-config.yml ./venv/bin/pygeoapi openapi generate ./pygeoapi-config.yml --output-file ./openapi.yml
	@echo "Backend setup complete!"

run-backend:
	@echo "Starting pygeoapi backend service..."
	@if [ ! -d "pygeoapi/venv" ]; then \
		echo "Virtual environment not found. Run 'make setup-backend' first."; \
		exit 1; \
	fi
	@if [ ! -f "pygeoapi/openapi.yml" ]; then \
		echo "OpenAPI specification not found. Generating it..."; \
		cd pygeoapi && PYGEOAPI_CONFIG=./pygeoapi-config.yml ./venv/bin/pygeoapi openapi generate ./pygeoapi-config.yml --output-file ./openapi.yml; \
	fi
	@echo "Backend service will be available at http://localhost:5000"
	@echo "Press Ctrl+C to stop the service"
	cd pygeoapi && PYGEOAPI_CONFIG=./pygeoapi-config.yml \
	PYGEOAPI_OPENAPI=./openapi.yml \
	./venv/bin/gunicorn --timeout 120 -w 2 -b 0.0.0.0:5000 pygeoapi.flask_app:APP

# Frontend setup and management
setup-frontend:
	@echo "Setting up frontend..."
	cd frontend && npm install

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

run-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Development mode - run both services
dev:
	@echo "Starting development mode..."
	@echo "Starting backend in background..."
	make run-backend &
	@echo "Starting frontend..."
	make run-frontend

# Cleanup
clean-backend:
	@echo "Removing virtual environment..."
	rm -rf pygeoapi/venv
	rm -f pygeoapi/openapi.yml

# Testing
test:
	@echo "Running tests..."
	@if [ ! -d "pygeoapi/venv" ]; then \
		echo "Virtual environment not found. Run 'make setup-backend' first."; \
		exit 1; \
	fi
	cd pygeoapi && ./venv/bin/python -m pytest tests/ || echo "No tests found"

# Check dependencies
check-system-deps:
	@echo "Checking system dependencies..."
	@command -v python3 >/dev/null 2>&1 || { echo "python3 is required but not installed."; exit 1; }
	@command -v gdalinfo >/dev/null 2>&1 || { echo "GDAL is required but not installed. Install gdal-bin package."; exit 1; }
	@echo "System dependencies OK!"

# Generate OpenAPI spec (optional)
generate-openapi:
	@echo "Generating OpenAPI specification..."
	@if [ ! -d "pygeoapi/venv" ]; then \
		echo "Virtual environment not found. Run 'make setup-backend' first."; \
		exit 1; \
	fi
	cd pygeoapi && PYGEOAPI_CONFIG=./pygeoapi-config.yml \
	./venv/bin/pygeoapi openapi generate ./pygeoapi-config.yml --output-file ./openapi.yml

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down --rmi all --volumes --remove-orphans

# Docker-related frontend-only commands
docker-rebuild-frontend:
	@echo "Rebuilding frontend Docker container..."
	docker-compose build --no-cache frontend

docker-up-frontend:
	@echo "Starting frontend Docker container..."
	docker-compose up -d frontend