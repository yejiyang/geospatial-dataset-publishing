# Makefile for Geospatial Dataset Publishing project

COMPOSE ?= docker compose
FRONTEND_DIR := frontend
PYTHON ?= python3
# ----- Container images -----
FRONTEND_IMAGE_LOCAL := local/global-tsunami-risk-map-frontend:latest
FRONTEND_IMAGE_REMOTE := ghcr.io/yejiyang/global-tsunami-risk-map-frontend:latest

# Utility containers for data processing (avoid local installs)
GDAL_IMAGE := osgeo/gdal:alpine-small-latest
TIPPE_IMAGE := emotionalcities/tippecanoe

# Other flags
LOCAL ?= false   # Set to 'true' to build and run with the local frontend image

# Paths
DATA_DIR := $(CURDIR)/data

.PHONY: help docker-build docker-up docker-down docker-logs docker-clean \
	docker-up-% docker-rebuild-% frontend-build frontend-serve \
	docker-build-frontend docker-run-local docker-run \
	hazard-fgb hazard-tiles

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

# Unified run target (use LOCAL=true to prefer the locally-built frontend image)
docker-run: ## Run the stack (use LOCAL=true for local frontend build)
	@if [ "$(LOCAL)" = "true" ]; then \
		echo "Building and running with local frontend image..."; \
		$(MAKE) docker-build-frontend; \
		USE_LOCAL_BUILD=$(FRONTEND_IMAGE_LOCAL) $(COMPOSE) up -d; \
	else \
		echo "Running with remote frontend image from GitHub..."; \
		echo "Pulling latest frontend image..."; \
		docker pull $(FRONTEND_IMAGE_REMOTE); \
		$(COMPOSE) up -d; \
	fi

# Backwards-compatibility alias
docker-run-local: ## Alias for 'LOCAL=true make docker-run'
	@$(MAKE) LOCAL=true docker-run

# Frontend development helpers
frontend-build: ## Build frontend assets
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

frontend-serve: ## Build and serve frontend locally
	@echo "Serving frontend locally on http://localhost:8080"
	cd $(FRONTEND_DIR)/src && $(PYTHON) -m http.server 8080

# -----------------------------------------------------------------------------
# Data processing helpers (Hazard dataset)
# -----------------------------------------------------------------------------

# Convert GeoJSON → FlatGeobuf using GDAL inside a lightweight container
hazard-fgb: ## Generate FlatGeobuf for Global Hazard Points via Docker
	@echo "[hazard-fgb] Converting GeoJSON to FlatGeobuf (containerised GDAL)…"
	docker run --rm -v $(DATA_DIR):/data $(GDAL_IMAGE) \
		ogr2ogr -f FlatGeobuf /data/hazard/global-hazard-points.fgb \
		/data/hazard/global-hazard-points.geojson -nln GlobalHazardPoints

# Create vector tiles (MVT) with tippecanoe inside a container
hazard-tiles: ## Generate vector tiles for Global Hazard Points via Docker
	@echo "[hazard-tiles] Building vector tiles with tippecanoe (containerised)…"
	docker run --rm -v $(DATA_DIR):/data $(TIPPE_IMAGE) \
		tippecanoe -r1 -pk -pf \
		--output-to-directory=/data/tiles/global-hazard-2/ \
		--force --maximum-zoom=15 \
		--extend-zooms-if-still-dropping \
		--no-tile-compression \
		/data/hazard/global-hazard-points.geojson
