/**
 * Adds hazard points layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addHazardLayers(map, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Add vector tiles source for Global Hazard Points
    map.addSource('hazard-pts', {
      type: 'vector',
      tiles: [`${apiBaseUrl}/collections/hazardglobal/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`],
      minzoom: 0,
      maxzoom: 15,
      bounds: [-180, -90, 180, 90] // Global bounds
    });
    
    // Add hazard points layer
    map.addLayer({
      'id': 'hazard-pt',
      'type': 'circle',
      'source': 'hazard-pts',
      'source-layer': 'hazardglobal',
      'layout': {},
      'paint': {
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

    // Hide loading indicator once loaded
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }

    // Click handler for hazard points
    map.on('click', 'hazard-pt', e => {
      const properties = e.features[0].properties;
      let html = '<h3>Hazard Global (Tiles)</h3><table style="width:100%">';
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

    // Add fly to button
    const navControl = document.querySelector('.maplibregl-ctrl-top-right');
    if (navControl) {
      const flyButton = document.createElement('button');
      flyButton.className = 'fly-button';
      flyButton.textContent = 'Fly to Hazard Global (Tiles)';
      flyButton.addEventListener('click', () => {
        map.flyTo({
          center: [0, 0],
          zoom: 2,
          essential: true
        });
      });
      navControl.appendChild(flyButton);
    }

    console.log('Hazard layers added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add hazard layers:', error);
    alert('Unable to load hazard points. Please check server configuration.');
    return false;
  }
}
