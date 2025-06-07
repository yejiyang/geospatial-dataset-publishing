# Geospatial Dataset Publishing Dev Environment

This repository contains a minimal Docker Compose setup for running
[pygeoapi](https://pygeoapi.io/) alongside a simple web client using
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
3. Access the web client at [http://localhost:8080](http://localhost:8080)

The web client fetches features from pygeoapi and displays them on a
MapLibre map and Chart.js chart.

## Data
The sample dataset resides in `data/points.geojson`. You can replace
this file with your own dataset. Update `pygeoapi/config/pygeoapi-config.yml`
if you change the path or dataset name.
