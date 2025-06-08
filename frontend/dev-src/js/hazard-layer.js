// Add this function to your code to add the global hazard points layer

/**
 * Adds Global Hazard Points vector tile layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addGlobalHazardTileLayers(map, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Add vector tiles source for Global Hazard Points
    map.addSource('global-hazard-source', {
      type: 'vector',
      tiles: [`${apiBaseUrl}/collections/hazardglobal/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`],
      minzoom: 0,
      maxzoom: 15,
      bounds: [-180, -90, 180, 90] // Global bounds
    });
    
    // Add Global Hazard Points layer
    map.addLayer({
      'id': 'hazard-pt', // Using the ID you mentioned
      'type': 'circle',
      'source': 'global-hazard-source',
      'source-layer': 'hazard_points_with_id', // Make sure this matches the layer name in your vector tiles
      'layout': {
        'visibility': 'visible' // Explicitly set to visible
      },
      'paint': {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 2,
          15, 8
        ],
        'circle-color': '#1e88e5', // Different color from Norway layer
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click interaction for Global Hazard Points features
    map.on('click', 'hazard-pt', e => {
      const properties = e.features[0].properties;
      
      // Create table of properties
      let html = '<h3>Global Hazard Points</h3><table style="width:100%">';
      
      // Display all properties
      for (const [key, value] of Object.entries(properties)) {
        if (key !== 'id' && key !== 'fid') {
          html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
        }
      }
      html += '</table>';
      
      new maplibregl.Popup({
        maxWidth: '500px',
        className: 'chart-popup'
      })
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
    });
    
    // Set cursor style on feature hover
    map.on('mouseenter', 'hazard-pt', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'hazard-pt', () => {
      map.getCanvas().style.cursor = '';
    });
    
    console.log("Global Hazard Points layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Global Hazard Points layer:", error);
    return false;
  }
}