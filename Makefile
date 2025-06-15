# Makefile for Geospatial Dataset Publishing project

COMPOSE ?= docker compose
FRONTEND_DIR := frontend
PYTHON ?= python3

.PHONY: help docker-build docker-up docker-down docker-logs docker-clean docker-rebuild-frontend docker-up-frontend docker-up-backend docker-rebuild-backend frontend-build frontend-serve

.DEFAULT_GOAL := help

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
	$(COMPOSE) build

docker-up:
	@echo "Starting Docker containers..."
	$(COMPOSE) up -d

docker-down:
	@echo "Stopping Docker containers..."
	$(COMPOSE) down

docker-logs:
	@echo "Viewing Docker logs..."
	$(COMPOSE) logs -f

docker-clean:
	@echo "Cleaning Docker resources..."
	$(COMPOSE) down --rmi all --volumes --remove-orphans

docker-rebuild-frontend:
	@echo "Rebuilding frontend Docker container..."
	$(COMPOSE) build --no-cache frontend

docker-up-frontend:
	@echo "Starting frontend Docker container..."
	$(COMPOSE) up -d frontend

docker-up-backend:
	@echo "Starting backend Docker container..."
	$(COMPOSE) up -d backend

# Docker backend-specific commands
docker-rebuild-backend:
	@echo "Rebuilding backend Docker container (no cache)..."
	$(COMPOSE) build --no-cache backend

# Frontend development helpers
frontend-build:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

frontend-serve:
	@echo "Serving frontend locally on http://localhost:8080"
	cd $(FRONTEND_DIR)/src && $(PYTHON) -m http.server 8080
