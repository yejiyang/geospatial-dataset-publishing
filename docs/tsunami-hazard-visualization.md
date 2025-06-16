# Global Tsunami Hazard Vector Tile Visualization

## Overview

This document describes the implementation and rendering of global tsunami hazard vector tiles in the geospatial dataset publishing platform. The visualization displays over 200,000 tsunami hazard points worldwide with interactive charts and risk-based color coding.

## Data Structure

### Source Dataset

- **Format**: GeoJSON (94MB) converted to FlatGeobuf (64MB) for efficient streaming
- **Points**: ~200,000 global tsunami hazard locations
- **Coordinate System**: WGS84 (EPSG:4326)
- **Tile Format**: Mapbox Vector Tiles (MVT) using Tippecanoe

### Feature Properties

Each tsunami hazard point contains the following attributes:

#### Core Location Data

- `Longitude`: Longitude coordinate
- `Latitude`: Latitude coordinate
- `id`: Unique identifier

#### Annual Recurrence Interval (ARI) Runup Heights

- `ari10`: 10-year return period runup height (meters)
- `ari50`: 50-year return period runup height (meters)
- `ari100`: 100-year return period runup height (meters)
- `ari200`: 200-year return period runup height (meters)
- `ari500`: 500-year return period runup height (meters)
- `ari1000`: 1000-year return period runup height (meters)
- `ari2500`: 2500-year return period runup height (meters)

#### Statistical Variants (500-year focus)

- `ari500LL`: 500-year ARI with sigma=0.5
- `ari500ZL`: 500-year ARI with sigma=0.0
- `ari500M`: 500-year ARI lower 95% confidence
- `ari500P`: 500-year ARI upper 95% confidence

#### Rate Data

- `rate_5`: Exceedance rate for 5m threshold
- `rate_10`: Exceedance rate for 10m threshold
- `rate_25`: Exceedance rate for 25m threshold
- `rate_50`: Exceedance rate for 50m threshold
- `rate_100`: Exceedance rate for 100m threshold
- `rate_300`: Exceedance rate for 300m threshold
- `rate_500`: Exceedance rate for 500m threshold
- `rate_1000`: Exceedance rate for 1000m threshold
- `rate_2000`: Exceedance rate for 2000m threshold

## Vector Tile Configuration

### Tile Service Setup

```yaml
# pygeoapi configuration
collections:
  hazardglobal:
    type: collection
    title: Global Tsunami Hazard Points
    description: Global tsunami hazard points with ARI runup heights
    provider:
      name: MVT-tippecanoe
      data: data/tiles/global-hazard/
      format: pbf
```

### Tippecanoe Generation

```bash
# Generate vector tiles from source data
make hazard-tiles

# Equivalent docker command:
docker run --rm -v $(pwd)/data:/data \
  tippecanoe/tippecanoe:latest \
  tippecanoe \
  --output-to-directory=/data/tiles/global-hazard/ \
  --force \
  --minimum-zoom=0 \
  --maximum-zoom=15 \
  --layer=globalhazardpoints \
  /data/hazard/global-hazard-points.fgb
```

## Rendering Implementation

### 1. MapLibre GL JS Layer Configuration

#### Vector Source

```javascript
map.addSource("global-hazard-source", {
  type: "vector",
  tiles: [
    `${apiBaseUrl}/collections/hazardglobal/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
  ],
  minzoom: 0,
  maxzoom: 15,
  bounds: [-180, -90, 180, 90],
});
```

#### Circle Layer with Dynamic Styling

```javascript
map.addLayer({
  id: "hazard-pt",
  type: "circle",
  source: "global-hazard-source",
  "source-layer": "globalhazardpoints",
  layout: {
    visibility: "visible",
  },
  paint: {
    // Dynamic sizing based on zoom level
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      1, // Continental view: 1px dots
      5,
      2, // Regional view: 2px dots
      10,
      4, // Local view: 4px dots
      15,
      8, // Detailed view: 8px dots
    ],

    // Risk-based color coding using ari500 values
    "circle-color": [
      "case",
      ["has", "ari500"],
      [
        "interpolate",
        ["linear"],
        ["get", "ari500"],
        0,
        "#4CAF50", // Green: Low risk (0-5m)
        5,
        "#FFC107", // Yellow: Medium risk (5-10m)
        10,
        "#FF9800", // Orange: High risk (10-20m)
        20,
        "#F44336", // Red: Very high risk (>20m)
      ],
      "#1a73e8", // Default blue for missing data
    ],

    // Progressive opacity for performance
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      0.6, // More transparent at low zoom
      10,
      0.8, // Medium opacity at mid zoom
      15,
      0.9, // Full opacity at high zoom
    ],

    // Zoom-dependent stroke
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      0, // No stroke at low zoom
      10,
      0.5, // Thin stroke at mid zoom
      15,
      1, // Full stroke at high zoom
    ],
    "circle-stroke-color": "#ffffff",
  },
});
```

### 2. Interactive Popup System

#### Popup Configuration

```javascript
const popup = new maplibregl.Popup({
  maxWidth: "480px",
  className: "chart-popup",
  closeOnClick: false,
  closeOnMove: false,
  anchor: "bottom",
  offset: [0, -10],
});
```

#### Smart Positioning

The popup system includes intelligent positioning to prevent jumping outside the viewport:

```javascript
// Adjust popup position if it goes off screen
setTimeout(() => {
  const popupElement = popup.getElement();
  const rect = popupElement.getBoundingClientRect();
  const mapContainer = map.getContainer().getBoundingClientRect();

  // Check boundaries and adjust offset
  if (rect.right > mapContainer.right) {
    popup.setOffset([-rect.width / 2, -10]);
  }
  if (rect.left < mapContainer.left) {
    popup.setOffset([rect.width / 2, -10]);
  }
  if (rect.top < mapContainer.top) {
    popup.setOffset([0, 10]);
  }
}, 50);
```

### 3. Chart.js Integration

#### ARI Runup Height Visualization

```javascript
const ariKeys = [
  "ari10",
  "ari50",
  "ari100",
  "ari200",
  "ari500",
  "ari1000",
  "ari2500",
];

const datasets = [
  {
    label: "Runup height (m)",
    data: ariKeys.map((k) => ({
      x: Number(k.replace("ari", "")),
      y: Number(properties[k] || 0),
    })),
    borderColor: "#1a73e8",
    backgroundColor: "rgba(26, 115, 232, 0.1)",
    fill: true,
    tension: 0.4,
  },
];
```

#### Statistical Variants Display

```javascript
const variants = [
  ["ari500LL", "σ=0.5", "#FF9800"],
  ["ari500ZL", "σ=0.0", "#4CAF50"],
  ["ari500M", "Lower 95%", "#F44336"],
  ["ari500P", "Upper 95%", "#9C27B0"],
];

variants.forEach(([key, label, color]) => {
  if (properties[key] !== undefined) {
    datasets.push({
      label,
      data: [{ x: 500, y: Number(properties[key]) }],
      showLine: false,
      pointRadius: 5,
      pointBackgroundColor: color,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
    });
  }
});
```

## Performance Optimization

### 1. Vector Tile Advantages

- **Efficient Loading**: 64MB FlatGeobuf vs 94MB GeoJSON (32% reduction)
- **Progressive Loading**: Only visible tiles loaded based on zoom/pan
- **Client-side Styling**: No server re-rendering needed for style changes
- **Scalable**: Handles 200K+ points smoothly

### 2. Zoom-based LOD (Level of Detail)

- **Zoom 0-5**: Minimal 1-2px dots for overview
- **Zoom 6-10**: Medium 2-4px dots for regional view
- **Zoom 11-15**: Large 4-8px dots for detailed analysis

### 3. Conditional Rendering

- **Opacity ramping**: Reduces visual clutter at low zoom levels
- **Stroke simplification**: No borders at low zoom for performance
- **Color computation**: Only when ari500 data exists

## Risk Assessment Color Scheme

The visualization uses a scientifically-informed color scheme based on tsunami runup heights:

| Runup Height | Risk Level | Color  | Hex Code | Description                       |
| ------------ | ---------- | ------ | -------- | --------------------------------- |
| 0-5m         | Low        | Green  | #4CAF50  | Minimal infrastructure damage     |
| 5-10m        | Medium     | Yellow | #FFC107  | Moderate coastal impact           |
| 10-20m       | High       | Orange | #FF9800  | Significant infrastructure damage |
| >20m         | Very High  | Red    | #F44336  | Catastrophic damage potential     |

## Data Export Features

### CSV Download

Each popup includes a download button that generates a CSV file with all point attributes:

```javascript
const header = Object.keys(properties).join(",");
const values = Object.values(properties).join(",");
const csv = `${header}\n${values}`;
const blob = new Blob([csv], { type: "text/csv" });
```

## Technical Requirements

### Browser Support

- **Modern browsers** with WebGL support
- **MapLibre GL JS**: Vector tile rendering engine
- **Chart.js**: Interactive chart generation

### Server Components

- **pygeoapi**: OGC API compliance and MVT serving
- **Tippecanoe**: Vector tile generation
- **Docker**: Containerized tile generation

## Usage Instructions

### 1. Basic Interaction

- **Pan/Zoom**: Standard map navigation
- **Click point**: Opens interactive popup with chart
- **Hover**: Cursor changes to pointer over points

### 2. Popup Features

- **Runup Chart**: Shows ARI values across return periods
- **Statistical Variants**: Uncertainty quantification at 500-year ARI
- **Properties**: Expandable table with all attributes
- **CSV Export**: Download point data

### 3. Map Controls

- **Satellite Toggle**: Switch between map and satellite view
- **Navigation**: Zoom in/out and compass controls
- **Full Screen**: Responsive design with fixed viewport

## Configuration Options

### Environment Variables

```bash
API_BASE_URL=http://localhost:5000  # API endpoint
```

### Build Process

```bash
cd frontend
npm run build  # Compiles and copies assets to dist/
```

## Future Enhancements

### Planned Features

1. **Clustering**: Point aggregation at low zoom levels
2. **Time Series**: Animation through different return periods
3. **Filtering**: Risk-level and region-based filtering
4. **3D Visualization**: Height-based extrusion of runup values

### Performance Improvements

1. **WebGL Point Rendering**: For even better performance with 200K+ points
2. **Adaptive Simplification**: Dynamic point reduction based on screen density
3. **Caching**: Browser-based tile caching for offline usage

---

_This documentation covers the complete implementation of tsunami hazard vector tile visualization. For technical support or feature requests, please refer to the project repository._
