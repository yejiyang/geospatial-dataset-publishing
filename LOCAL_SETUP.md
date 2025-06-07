# Local Development Setup

This guide explains how to run the geospatial dataset publishing application locally without Docker.

## Prerequisites

1. **Python 3.8+** - Make sure Python 3.8 or later is installed
2. **GDAL** - Required for geospatial data processing
3. **Node.js and npm** - For frontend development

### Installing System Dependencies

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install python3 python3-venv python3-pip gdal-bin libgdal-dev python3-dev
```

#### macOS
```bash
brew install python3 gdal
```

#### CentOS/RHEL
```bash
sudo yum install python3 python3-pip gdal gdal-devel
```

## Quick Start

1. **Clone the repository** (if not already done)

2. **View all available commands**:
   ```bash
   make help
   ```

3. **Check system dependencies**:
   ```bash
   make check-system-deps
   ```

4. **Set up the backend**:
   ```bash
   make setup-backend
   ```

5. **Run the backend service**:
   ```bash
   make run-backend
   ```
   The API will be available at `http://localhost:5000`
   Press `Ctrl+C` to stop the service

6. **Set up the frontend** (optional, in a separate terminal):
   ```bash
   make setup-frontend
   ```

7. **Run the frontend** (in a separate terminal):
   ```bash
   make run-frontend
   ```

## Available Make Commands

Run `make help` to see all available commands:

- `make help` - Show all available commands
- `make setup-backend` - Create virtual environment and install Python dependencies
- `make run-backend` - Start the pygeoapi backend service
- `make setup-frontend` - Install frontend dependencies
- `make build-frontend` - Build frontend for production
- `make run-frontend` - Start frontend development server
- `make dev` - Run both backend and frontend together
- `make clean-backend` - Remove virtual environment and generated files
- `make test` - Run tests
- `make check-system-deps` - Verify system dependencies
- `make generate-openapi` - Generate OpenAPI specification (optional)

## File Structure

The project is now organized as follows:
```
geospatial-dataset-publishing/
├── pygeoapi/                    # Backend files
│   ├── venv/                   # Python virtual environment
│   ├── installation.txt       # Python dependencies
│   ├── pygeoapi-config.yml    # Backend configuration
│   ├── openapi.yml            # Generated OpenAPI spec
│   └── Dockerfile             # Docker configuration (legacy)
├── data/                       # Geospatial data files
├── frontend/                   # Frontend files
├── Makefile                    # Build and run commands
└── LOCAL_SETUP.md             # This documentation
```

## Backend Details

The backend uses:
- **pygeoapi** - OGC API compliant geospatial web API
- **gunicorn** - WSGI HTTP server for Python
- **GDAL** - Geospatial Data Abstraction Library

### Configuration

The backend configuration is in `pygeoapi/pygeoapi-config.yml`. The service will:
- Run on `http://localhost:5000`
- Serve geospatial data from the `data/` directory
- Provide OGC API Features endpoints
- Generate OpenAPI specification automatically

### Troubleshooting

**GDAL installation issues:**
- Make sure GDAL is properly installed system-wide
- On Ubuntu: `sudo apt-get install gdal-bin libgdal-dev`
- On macOS: `brew install gdal`

**Virtual environment issues:**
- Remove and recreate: `make clean-backend && make setup-backend`

**Port already in use:**
- Make sure no other services are running on port 5000
- Kill existing processes: `lsof -ti:5000 | xargs kill -9`

**GDAL version mismatch:**
- The installation.txt file is configured for GDAL 3.4.1 to match the system library
- If you have a different GDAL version, update the version in `pygeoapi/installation.txt`

**OpenAPI specification issues:**
- The service automatically generates the OpenAPI spec on startup
- If needed, manually generate with: `make generate-openapi`

## API Endpoints

Once running, you can access:
- API landing page: `http://localhost:5000/`
- OpenAPI documentation: `http://localhost:5000/openapi`
- Collections: `http://localhost:5000/collections`
- Points collection: `http://localhost:5000/collections/points/items`

## Development Notes

- The virtual environment is created in `./pygeoapi/venv/`
- Python dependencies are listed in `pygeoapi/installation.txt`
- OpenAPI specification is generated at `pygeoapi/openapi.yml`
- Logs are written to `/tmp/pygeoapi.log`
- The backend serves data from the `./data/` directory
- Configuration file: `pygeoapi/pygeoapi-config.yml` 