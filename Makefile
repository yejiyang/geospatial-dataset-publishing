# Makefile for Geospatial Dataset Publishing project

COMPOSE ?= docker compose
FRONTEND_DIR := frontend
PYTHON ?= python3
FRONTEND_IMAGE_LOCAL := local/global-tsunami-risk-map-frontend:latest
FRONTEND_IMAGE_REMOTE := ghcr.io/yejiyang/global-tsunami-risk-map-frontend:latest

.PHONY: help docker-build docker-up docker-down docker-logs docker-clean \
	docker-up-% docker-rebuild-% frontend-build frontend-serve \
	docker-build-frontend docker-run-local docker-run

.DEFAULT_GOAL := help

help: ## Show this help
	@grep -E '^[-a-zA-Z0-9_%]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'


# Docker commands
docker-build: ## Build all Docker images
	@echo "Building Docker images..."
	$(COMPOSE) build

docker-up: ## Start all Docker containers
	@echo "Starting Docker containers..."
	$(COMPOSE) up -d

docker-down: ## Stop all Docker containers
	@echo "Stopping Docker containers..."
	$(COMPOSE) down

docker-logs: ## View Docker container logs
	@echo "Viewing Docker logs..."
	$(COMPOSE) logs -f

docker-clean: ## Remove Docker containers, images, and volumes
	@echo "Cleaning Docker resources..."
	$(COMPOSE) down --rmi all --volumes --remove-orphans

# Service-specific commands
docker-rebuild-%: ## Rebuild a specific service without cache
	@echo "Rebuilding $* Docker container (no cache)..."
	$(COMPOSE) build --no-cache $*

docker-up-%: ## Start a specific service
	@echo "Starting $* Docker container..."
	$(COMPOSE) up -d $*

# Build and run with local or remote frontend image
docker-build-frontend: ## Build local frontend Docker image
	@echo "Building local frontend Docker image..."
	docker build -t $(FRONTEND_IMAGE_LOCAL) ./$(FRONTEND_DIR)

docker-run-local: docker-build-frontend ## Run with locally built frontend image
	@echo "Running with local frontend image..."
	USE_LOCAL_BUILD=$(FRONTEND_IMAGE_LOCAL) $(COMPOSE) up -d

docker-run: ## Run with remote frontend image from GitHub
	@echo "Running with remote frontend image from GitHub..."
	@echo "Pulling latest frontend image..."
	docker pull $(FRONTEND_IMAGE_REMOTE)
	$(COMPOSE) up -d

# Frontend development helpers
frontend-build: ## Build frontend assets
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

frontend-serve: ## Build and serve frontend locally
	@echo "Serving frontend locally on http://localhost:8080"
	cd $(FRONTEND_DIR)/src && $(PYTHON) -m http.server 8080
