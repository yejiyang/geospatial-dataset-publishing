/**
 * Adds hazard points layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
async function addHazardLayers(map, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Check if tiles endpoint exists
    const response = await fetch(`${apiBaseUrl}/collections/hazard_points_fgb/tiles`);
    if (!response.ok) {
      throw new Error('Tiles endpoint not available');
    }

    // Add vector tiles source
    map.addSource('hazard-pts', {
      type: 'vector',
      tiles: [`${apiBaseUrl}/collections/hazard_points_fgb/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`],
      minzoom: 0,
      maxzoom: 15
    });

    // Add hazard points layer with optimized rendering
    map.addLayer({
      id: 'hazard-pt',
      type: 'circle',
      source: 'hazard-pts',
      'source-layer': 'GlobalHazardPoints',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 1,
          10, 3,
          15, 5
        ],
        'circle-color': '#0066FF',
        'circle-opacity': 0.7,
        'circle-stroke-width': [
          'interpolate', ['linear'], ['zoom'],
          0, 0,
          10, 0.5,
          15, 1
        ],
        'circle-stroke-color': '#FFFFFF'
      }
    });

    // Add heat map layer for better overview of density
    map.addLayer({
      id: 'hazard-heat',
      type: 'heatmap',
      source: 'hazard-pts',
      'source-layer': 'GlobalHazardPoints',
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': [
          'interpolate', ['linear'], ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'rgba(0, 0, 255, 0.2)',
          0.4, 'rgba(0, 0, 255, 0.4)',
          0.6, 'rgba(0, 102, 255, 0.6)',
          0.8, 'rgba(0, 179, 255, 0.8)',
          1, 'rgba(0, 255, 255, 1)'
        ],
        'heatmap-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 2,
          9, 20
        ],
        'heatmap-opacity': [
          'interpolate', ['linear'], ['zoom'],
          7, 1,
          9, 0
        ]
      },
      maxzoom: 9
    });

    // Hide loading indicator once loaded
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }

    // Click handler for hazard points
    map.on('click', 'hazard-pt', e => {
      const properties = e.features[0].properties;
      let html = '<h3>Hazard Point</h3><table style="width:100%">';
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

    // Set cursor style on point hover
    map.on('mouseenter', 'hazard-pt', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'hazard-pt', () => {
      map.getCanvas().style.cursor = '';
    });

    console.log('Hazard layers added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add hazard layers:', error);
    alert('Unable to load all 200,000 points efficiently. Please check server configuration.');
    return false;
  }
}
