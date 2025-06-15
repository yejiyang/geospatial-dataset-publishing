# Geospatial Dataset Publishing Dev Environment

This repository contains a minimal Docker Compose setup for running
[pygeoapi](https://pygeoapi.io/) alongside a simple frontend using
[MapLibre](https://maplibre.org/) and [Chart.js](https://www.chartjs.org/).

## Prerequisites

- Docker Desktop with Docker Compose v2+
- (Optional) GDAL >= 3.0 for converting data to other formats

## Usage

1. Build and start the services:
   ```bash
   docker compose up --build
   ```
2. Access pygeoapi at [http://localhost:5000](http://localhost:5000)
3. Access the frontend at [http://localhost:8080](http://localhost:8080)

## Deployment

### Environment Variables

When deploying in different environments (local, Kubernetes, etc.), the following environment variables should be set:

#### Backend (pygeoapi):

- `PYGEOAPI_SERVER_URL`: The external URL where pygeoapi will be accessible. This is used to generate correct links in the API responses.
  - For local development: `http://localhost:5000`
  - For Kubernetes/production: Your domain, e.g., `https://your-domain.com/api`

#### Frontend:

- `API_BASE_URL`: The URL where the frontend will connect to the backend API.
  - For local development: Not needed (will default to `http://localhost:5000`)
  - For Docker Compose: `http://backend:5000`
  - For Kubernetes/production: `/api` (path to the backend service through the ingress)

### Kubernetes Deployment

To deploy to Kubernetes:

1. Update domain and path settings in `k8s-deployment.yaml`
2. Apply the configuration:

```bash
kubectl apply -f k8s-deployment.yaml
```

This will deploy both the frontend and backend services with the proper configuration.

The backend Docker image now generates the OpenAPI document at build
time and exposes it via the `PYGEOAPI_OPENAPI` environment variable.

The frontend fetches features from pygeoapi and displays them on a
MapLibre map and Chart.js chart.

## Data

The sample dataset resides in `data/norway/norway-hazard-points.geojson`. You can replace
this file with your own dataset. Update `pygeoapi-config.yml`
if you change the path or dataset name.

## Development

This repository uses **Black**, **isort**, and **Ruff** for Python code. The frontend is formatted with **Prettier**. Recommended VS Code settings are provided in the `.vscode` folder.
Run `pip install -r requirements-dev.txt` to install Python tooling. Frontend formatting tools can be installed by running `npm install` inside the `frontend` directory.
Use `npm run format` to format frontend code.

## CI/CD

A GitHub Actions workflow builds and publishes the frontend Docker image whenever
changes are pushed to the `frontend/` directory on the `main` branch. The image
is pushed to the GitHub Container Registry under the tag
`global-tsunami-risk-map-frontend`.

Another workflow builds a custom `pygeoapi` image containing the data from this
repository. Whenever files in the `data/` or `pygeoapi/` folders change, the
workflow bumps the repository `VERSION` file and publishes a new Docker image
named `pygeoapi-w-global-tsunami-data`. The image tag combines the upstream
pygeoapi version with the bumped repository version.
