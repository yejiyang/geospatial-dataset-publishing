# Makefile for Geospatial Dataset Publishing project

.PHONY: help docker-build docker-up docker-down docker-logs docker-clean docker-rebuild-frontend docker-up-frontend docker-up-backend docker-rebuild-backend frontend-build frontend-serve

# Default target
help:
	@echo "Geospatial Dataset Publishing Project"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build            - Build all Docker images"
	@echo "  docker-up               - Start all Docker containers"
	@echo "  docker-down             - Stop all Docker containers"
	@echo "  docker-logs             - View Docker container logs"
	@echo "  docker-clean            - Remove Docker containers, images, and volumes"
	@echo "  docker-rebuild-backend  - Rebuild backend container (no cache)"
	@echo "  docker-rebuild-frontend - Rebuild frontend container (no cache)"
	@echo "  docker-up-frontend      - Start only the frontend container"
	@echo "  docker-up-backend       - Start only the backend container"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  frontend-build          - Build frontend assets"
	@echo "  frontend-serve          - Build and serve frontend locally"


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

docker-up-backend:
	@echo "Starting backend Docker container..."
	docker-compose up -d backend

# Docker backend-specific commands
docker-rebuild-backend:
	@echo "Rebuilding backend Docker container (no cache)..."
	docker-compose build --no-cache backend

# Frontend development helpers
frontend-build:
	@echo "Building frontend..."
	cd frontend && npm run build

frontend-serve:
	@echo "Serving frontend locally on http://localhost:8080"
	cd frontend/src && python3 -m http.server 8080
