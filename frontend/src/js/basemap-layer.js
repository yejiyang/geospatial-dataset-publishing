/**
 * Returns the base map style configuration for MapLibre
 * @returns {Object} Base map style configuration
 */
function getBaseMapStyle() {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

/**
 * Initializes the map with the base map configuration
 * @param {string} containerId - ID of the HTML element to contain the map
 * @returns {Object} Initialized MapLibre map instance
 */
function initializeMap(containerId) {
  return new maplibregl.Map({
    container: containerId,
    style: getBaseMapStyle(),
    center: [0, 20],
    zoom: 2,
    maxZoom: 19,
    // Using the default preserveDrawingBuffer value (false) improves
    // rendering performance when displaying many features.
    preserveDrawingBuffer: false,
  });
}
