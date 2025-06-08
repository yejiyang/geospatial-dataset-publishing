// Function to add points layer to the map
/**
 * Adds Norway hazard points layer to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addPointsLayer(map, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Add source for Norway points
    map.addSource('norway-points', {
      type: 'geojson',
      data: `${apiBaseUrl}/collections/points/items?f=json&limit=1000`,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    // Add clusters layer
    map.addLayer({
      id: 'norway-clusters',
      type: 'circle',
      source: 'norway-points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10, '#f1f075',
          50, '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          50, 40
        ]
      }
    });

    // Add cluster count layer
    map.addLayer({
      id: 'norway-cluster-count',
      type: 'symbol',
      source: 'norway-points',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Add unclustered point layer
    map.addLayer({
      id: 'norway-points-layer',
      type: 'circle',
      source: 'norway-points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#FF6600',
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 3,
          12, 8
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#FFFFFF',
        'circle-opacity': 0.8
      }
    });

    // Add click interaction for clusters
    map.on('click', 'norway-clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['norway-clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      
      map.getSource('norway-points').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          
          map.flyTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Add click interaction for individual points
    map.on('click', 'norway-points-layer', e => {
      const properties = e.features[0].properties;
      let html = '<h3>Norway Hazard Point</h3><table style="width:100%">';
      
      // Display important fields first
      if (properties.Magnitude) {
        html += `<tr><td><strong>Magnitude</strong></td><td>${properties.Magnitude}</td></tr>`;
      }
      if (properties.Year) {
        html += `<tr><td><strong>Year</strong></td><td>${properties.Year}</td></tr>`;
      }
      if (properties.Longitude && properties.Latitude) {
        html += `<tr><td><strong>Location</strong></td><td>${properties.Longitude.toFixed(4)}, ${properties.Latitude.toFixed(4)}</td></tr>`;
      }
      
      // Add other properties
      for (const [key, value] of Object.entries(properties)) {
        if (!['Magnitude', 'Year', 'Longitude', 'Latitude'].includes(key) && 
            key !== 'id' && key !== 'fid') {
          html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
        }
      }
      html += '</table>';

      new maplibregl.Popup({
        maxWidth: '400px',
        className: 'point-popup'
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });
    
    // Set cursor style on feature hover
    map.on('mouseenter', 'norway-points-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseenter', 'norway-clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'norway-points-layer', () => {
      map.getCanvas().style.cursor = '';
    });
    
    map.on('mouseleave', 'norway-clusters', () => {
      map.getCanvas().style.cursor = '';
    });
    
    // Add button to fly to Norway
    addNorwayButton(map);
    
    // Hide loading indicator once loaded
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
    
    console.log("Norway points layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Norway points layer:", error);
    return false;
  }
}

/**
 * Adds a button to fly to Norway
 * @param {Object} map - The MapLibre GL JS map instance
 */
function addNorwayButton(map) {
  const norwayButton = document.createElement('button');
  norwayButton.textContent = 'Fly to Norway';
  norwayButton.style.position = 'absolute';
  norwayButton.style.bottom = '10px';
  norwayButton.style.left = '150px'; // Position next to Hyderabad button
  norwayButton.style.padding = '8px';
  norwayButton.style.borderRadius = '4px';
  norwayButton.style.backgroundColor = '#FF6600';
  norwayButton.style.color = 'white';
  norwayButton.style.border = 'none';
  norwayButton.style.cursor = 'pointer';
  
  norwayButton.addEventListener('click', () => {
    map.flyTo({
      center: [15, 65], // Center of Norway
      zoom: 5,
      essential: true
    });
  });
  
  document.body.appendChild(norwayButton);
}
