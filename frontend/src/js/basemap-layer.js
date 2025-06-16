/**
 * Returns the base map style configuration for MapLibre with Google Maps-like styling
 * @returns {Object} Base map style configuration
 */
function getBaseMapStyle() {
  return {
    version: 8,
    sources: {
      // Using CartoDB Positron for a cleaner, Google Maps-like appearance
      "cartodb-light": {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
          "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
          "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
          "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors, © CARTO",
        maxzoom: 19,
      },
      // Satellite layer for satellite view
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution:
          "© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "base-map",
        type: "raster",
        source: "cartodb-light",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

/**
 * Initializes the map with the base map configuration and Google Maps-like settings
 * @param {string} containerId - ID of the HTML element to contain the map
 * @returns {Object} Initialized MapLibre map instance
 */
function initializeMap(containerId) {
  const map = new maplibregl.Map({
    container: containerId,
    style: getBaseMapStyle(),
    center: [0, 20], // Centered on equator with slight northern bias for better land visibility
    zoom: 2,
    minZoom: 1,
    maxZoom: 19,
    // Improved performance settings
    preserveDrawingBuffer: false,
    // Google Maps-like interaction settings
    doubleClickZoom: true,
    dragRotate: false, // Disable rotation for simpler interaction
    pitchWithRotate: false,
    touchZoomRotate: false,
    // Smooth animations
    trackResize: true,
  });

  // Add map style switcher control
  map.on("load", () => {
    // Add satellite layer but keep it hidden initially
    if (!map.getLayer("satellite-layer")) {
      map.addLayer(
        {
          id: "satellite-layer",
          type: "raster",
          source: "satellite",
          layout: {
            visibility: "none",
          },
          minzoom: 0,
          maxzoom: 19,
        },
        "base-map"
      );
    }

    // Create custom control for map style switching
    class StyleSwitchControl {
      constructor() {
        this.isLight = true;
      }

      onAdd(map) {
        this.map = map;
        this.container = document.createElement("div");
        this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

        // Satellite button
        this.satelliteBtn = document.createElement("button");
        this.satelliteBtn.className = "maplibregl-ctrl-icon";
        this.satelliteBtn.type = "button";
        this.satelliteBtn.title = "Satellite View";
        this.satelliteBtn.innerHTML = "🛰️";
        this.satelliteBtn.style.fontSize = "14px";
        this.satelliteBtn.onclick = () => this.toggleSatellite();

        // Terrain button
        this.terrainBtn = document.createElement("button");
        this.terrainBtn.className = "maplibregl-ctrl-icon";
        this.terrainBtn.type = "button";
        this.terrainBtn.title = "Map View";
        this.terrainBtn.innerHTML = "🗺️";
        this.terrainBtn.style.fontSize = "14px";
        this.terrainBtn.onclick = () => this.showTerrain();

        this.container.appendChild(this.satelliteBtn);
        this.container.appendChild(this.terrainBtn);

        return this.container;
      }

      onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
      }

      toggleSatellite() {
        if (
          this.map.getLayoutProperty("satellite-layer", "visibility") ===
          "visible"
        ) {
          this.map.setLayoutProperty("satellite-layer", "visibility", "none");
          this.map.setLayoutProperty("base-map", "visibility", "visible");
          this.satelliteBtn.style.backgroundColor = "";
        } else {
          this.map.setLayoutProperty(
            "satellite-layer",
            "visibility",
            "visible"
          );
          this.map.setLayoutProperty("base-map", "visibility", "none");
          this.satelliteBtn.style.backgroundColor = "#1a73e8";
          this.satelliteBtn.style.color = "white";
        }
      }

      showTerrain() {
        this.map.setLayoutProperty("satellite-layer", "visibility", "none");
        this.map.setLayoutProperty("base-map", "visibility", "visible");
        this.satelliteBtn.style.backgroundColor = "";
        this.satelliteBtn.style.color = "";
      }
    }

    // Add the style switch control
    map.addControl(new StyleSwitchControl(), "top-left");
  });

  return map;
}
