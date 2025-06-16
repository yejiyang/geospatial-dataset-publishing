# Geospatial Dataset Publishing Platform - Agent Guide

## Project Overview

This is a comprehensive geospatial data visualization platform for publishing and visualizing tsunami hazard datasets globally. The platform combines modern web mapping technology with scientific data visualization to provide interactive access to ~200,000 tsunami hazard points worldwide.

## Architecture Overview

### Technology Stack

- **Backend**: Python (pygeoapi) - OGC API compliant geospatial API server
- **Frontend**: Vanilla JavaScript + MapLibre GL JS + Chart.js
- **Data Processing**: GDAL, Tippecanoe for vector tile generation
- **Containerization**: Docker, Docker Compose
- **Deployment**: Kubernetes (k8s manifests provided)

### Key Components

#### 1. Frontend (`/frontend`)

- **Build System**: Node.js with custom build script (`build.js`)
- **Source**: `src/` directory (HTML, CSS, JS)
- **Distribution**: `dist/` directory (auto-generated, DO NOT EDIT)
- **Styling**: Google Maps-inspired responsive design
- **Maps**: MapLibre GL JS with vector tile rendering

#### 2. Backend (`/pygeoapi`)

- **Configuration**: `pygeoapi-config.yml` - defines data collections and services
- **Docker**: Custom Dockerfile with health checks
- **API Standards**: OGC API - Features, Tiles, Maps compliance

#### 3. Data Pipeline (`/data`)

- **Source Data**: GeoJSON files converted to optimized formats
- **Vector Tiles**: Generated using Tippecanoe (MVT format)
- **Formats**: FlatGeobuf (.fgb) for efficient streaming

## Data Architecture

### Global Tsunami Hazard Dataset

- **Points**: ~200,000 global tsunami hazard locations
- **Source**: Davies et al. (2018) - Global probabilistic tsunami hazard assessment
- **Format**: Vector tiles (MVT) served via pygeoapi
- **Properties**:
  - `ari10`, `ari50`, `ari100`, `ari200`, `ari500`, `ari1000`, `ari2500`: Annual Recurrence Interval runup heights (meters)
  - `ari500LL`, `ari500ZL`, `ari500M`, `ari500P`: Statistical variants for 500-year ARI
  - `rate_*`: Exceedance rates for various thresholds

### Risk Classification

- **Green (#4CAF50)**: Low Risk (0-5m runup) - Minimal damage
- **Yellow (#FFC107)**: Medium Risk (5-10m runup) - Moderate impact
- **Orange (#FF9800)**: High Risk (10-20m runup) - Significant damage
- **Red (#F44336)**: Very High Risk (>20m runup) - Catastrophic damage

## Frontend Development Guidelines

### File Structure

```
frontend/
├── src/
│   ├── index.html          # Main application template
│   └── js/
│       ├── basemap-layer.js     # Map initialization & base layers
│       ├── hazard-layer.js      # Tsunami hazard point visualization
│       ├── hyderabad-layer.js   # Regional dataset (Hyderabad)
│       ├── norway-hazard-tiles.js # Regional dataset (Norway)
│       └── points-layer.js      # Generic point layer utilities
├── dist/                   # Auto-generated (DO NOT EDIT)
├── build.js               # Build system
└── package.json          # Dependencies
```

### Key JavaScript Patterns

#### 1. Map Initialization

```javascript
const map = initializeMap("map");
// Defined in basemap-layer.js, returns configured MapLibre GL map
```

#### 2. Layer Management

```javascript
function addGlobalHazardTiles(map, apiBaseUrl) {
  // Pattern: Add vector tile source + styled layer + interactions
}
```

#### 3. Popup System

- Uses MapLibre GL popups with Chart.js integration
- Smart positioning to prevent viewport overflow
- CSV export functionality for point data

### Styling Guidelines

- **Design Language**: Google Maps inspired
- **Colors**: Material Design color palette
- **Typography**: Roboto font family
- **Responsive**: Mobile-first approach with breakpoints at 768px and 480px
- **Glass Morphism**: `backdrop-filter: blur()` for modern panel effects

## API Integration

### pygeoapi Endpoints

- **Base URL**: Configurable via `API_BASE_URL` environment variable
- **Vector Tiles**: `/collections/{collection}/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`
- **Collections**:
  - `hazardglobal`: Global tsunami hazard points
  - `hyderabad`: Regional Hyderabad ward boundaries
  - Additional collections as configured

### Data Loading Pattern

```javascript
map.addSource("source-name", {
  type: "vector",
  tiles: [
    `${apiBaseUrl}/collections/{collection}/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
  ],
  minzoom: 0,
  maxzoom: 15,
});
```

## Build and Deployment

### Development Workflow

1. **Edit source files** in `frontend/src/`
2. **Build**: `cd frontend && npm run build`
3. **Test locally**: Serve `frontend/dist/`
4. **Deploy**: Use Docker Compose or Kubernetes manifests

### Environment Variables

- `API_BASE_URL`: Backend API endpoint (injected during build)
- `VERSION`: Application version (from package.json)

### Docker Compose

```bash
docker-compose up  # Starts full stack (frontend + pygeoapi)
```

### Kubernetes

```bash
kubectl apply -f k8s-frontend.yaml
kubectl apply -f k8s-pygeoapi.yaml
```

## Data Processing Pipeline

### Vector Tile Generation

```bash
make hazard-fgb    # GeoJSON → FlatGeobuf conversion
make hazard-tiles  # FlatGeobuf → Vector tiles (MVT)
```

### File Formats

- **Source**: GeoJSON (large files, ~94MB)
- **Optimized**: FlatGeobuf (32% smaller, streamable)
- **Tiles**: MVT (Mapbox Vector Tiles) for efficient web delivery

## Performance Optimizations

### Frontend

- **Vector Tiles**: Only load visible tiles based on zoom/pan
- **Level of Detail**: Zoom-dependent point sizing and opacity
- **Chart Rendering**: Lazy loading with timeout handling
- **Popup Management**: Smart positioning and content streaming

### Backend

- **Caching**: Vector tiles cached at multiple levels
- **Compression**: Gzip compression for tile delivery
- **Health Checks**: Automated monitoring and recovery

## Common Development Tasks

### Adding New Dataset

1. **Prepare Data**: Convert to FlatGeobuf format
2. **Generate Tiles**: Use Tippecanoe via Makefile
3. **Configure pygeoapi**: Add collection in `pygeoapi-config.yml`
4. **Frontend Layer**: Create new JavaScript module in `src/js/`
5. **Build**: Run `npm run build`

### Styling Updates

1. **Edit**: Modify styles in `src/index.html` `<style>` section
2. **Build**: `npm run build` to update distribution
3. **Test**: Verify responsive behavior on multiple screen sizes

### API Changes

1. **Backend**: Update `pygeoapi-config.yml`
2. **Frontend**: Modify API calls in relevant JS modules
3. **Build**: Rebuild frontend to pick up changes

## Scientific Context

### Reference Paper

Davies, G., Griffin, J., Løvholt, F., Glimsdal, S., Harbitz, C., Thio, H.K., Lorito, S., Basili, R., Selva, J., Geist, E.L. and Baptista, M.A. (2018). A global probabilistic tsunami hazard assessment from earthquake sources. _Geological Society, London, Special Publications_, 456, 219-244.

### Data Significance

- **Global Coverage**: First comprehensive global PTHA using uniform methodology
- **Probabilistic Approach**: Provides exceedance rates rather than single scenarios
- **Uncertainty Quantification**: Includes confidence intervals and statistical variants
- **Policy Relevance**: Supports international disaster risk reduction frameworks

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version and dependencies
2. **API connection**: Verify `API_BASE_URL` configuration
3. **Tile loading**: Check pygeoapi health and network connectivity
4. **Performance**: Monitor browser console for JS errors

### Debug Tools

- **Browser DevTools**: Network tab for API calls, Console for JS errors
- **Health Check**: `{API_BASE_URL}/health` endpoint
- **Tile Inspector**: MapLibre GL debug tools for tile analysis

## Future Development

### Planned Features

- Point clustering for better performance at low zoom levels
- Time series animation through different return periods
- Advanced filtering by risk level and geographic region
- 3D visualization with height-based extrusion

### Technical Debt

- Migrate from inline styles to separate CSS files
- Implement proper state management for complex interactions
- Add unit tests for JavaScript modules
- Enhance error handling and user feedback

---

_This agent guide provides comprehensive context for AI assistants working on this geospatial visualization platform. It covers architecture, development patterns, data workflows, and scientific context needed for effective code assistance._
