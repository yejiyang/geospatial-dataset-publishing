# Makefile for Geospatial Dataset Publishing project

.PHONY: help setup-backend run-backend dev clean-backend test check-system-deps generate-openapi docker-build docker-up docker-down docker-logs docker-clean docker-rebuild-frontend docker-up-frontend frontend-serve frontend-copy

# Default target
help:
	@echo "Geospatial Dataset Publishing Project"
	@echo ""
	@echo "Backend Commands:"
	@echo "  setup-backend    - Create virtual environment and install backend dependencies"
	@echo "  run-backend      - Run pygeoapi backend service locally"
	@echo "  clean-backend    - Remove virtual environment"
	@echo "  generate-openapi - Generate OpenAPI specification"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  frontend-serve   - Serve frontend with Python's HTTP server"
	@echo "  frontend-copy    - Copy development HTML to dist directory"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev              - Run both backend and frontend in development mode"
	@echo "  test             - Run tests"
	@echo "  check-system-deps - Check system dependencies"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build     - Build all Docker images"
	@echo "  docker-up        - Start all Docker containers"
	@echo "  docker-down      - Stop all Docker containers"
	@echo "  docker-logs      - View Docker container logs"
	@echo "  docker-clean     - Remove Docker containers, images, and volumes"
	@echo "  docker-rebuild-frontend - Rebuild only the frontend container"
	@echo "  docker-up-frontend      - Start only the frontend container"

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

frontend-serve:
	@echo "Serving frontend locally with Python's built-in HTTP server..."
	cd frontend && python3 -m http.server 8080

frontend-copy:
	@echo "Copying development file to frontend directory..."
	mkdir -p frontend/dist
	cp frontend/dev-src/index.html frontend/dist/index.html

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

# Docker commands
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

docker-rebuild-frontend:
	@echo "Rebuilding frontend Docker container..."
	docker-compose build --no-cache frontend

docker-up-frontend:
	@echo "Starting frontend Docker container..."
	docker-compose up -d frontend