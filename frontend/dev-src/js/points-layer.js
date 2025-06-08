// Function to add points layer to the map
/**
 * Adds Norway hazard points layer to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
async function addPointsLayer(map, apiBaseUrl = 'http://localhost:5000') {
  try {
    // Show loading indicator
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'block';
      loading.innerText = "Loading Norway points...";
    }
    
    // Fetch all points using pagination if necessary
    const data = await fetchAllPoints(apiBaseUrl, 'points', 2000);
    console.log(`Total points fetched: ${data.features.length}`);
    
    if (data.features.length === 0) {
      console.error("No points found in Norway region");
      if (loading) {
        loading.style.display = 'none';
      }
      return false;
    }
    
    // Add source with fetched data
    map.addSource('norway-points', {
      type: 'geojson',
      data: data
    });
    
    // Add unclustered point layer
    map.addLayer({
      id: 'norway-points-layer',
      type: 'circle',
      source: 'norway-points',
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
    
    map.on('mouseleave', 'norway-points-layer', () => {
      map.getCanvas().style.cursor = '';
    });
    
    // Hide loading indicator
    if (loading) {
      loading.style.display = 'none';
    }
    
    // Add button to fly to Norway
    addNorwayButton(map);
    
    console.log("Norway points layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Norway points layer:", error);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
    return false;
  }
}

/**
 * Fetch all points with pagination support
 * @param {string} apiBaseUrl - Base URL for the API
 * @param {string} collectionId - Collection ID to fetch
 * @param {number} limit - Number of items per page (not used in URL)
 * @returns {Object} GeoJSON feature collection
 */
async function fetchAllPoints(apiBaseUrl, collectionId, limit = 2000) {
  let allFeatures = [];
  // Start with offset 0 and increment by 1000
  let offset = 0;
  let hasMoreData = true;
  
  // Track number of requests to avoid infinite loops
  let requestCount = 0;
  const maxRequests = 1000; // Safety limit
  
  while (hasMoreData && requestCount < maxRequests) {
    requestCount++;
    // Use only the offset parameter in the URL, not limit
    const url = `${apiBaseUrl}/collections/${collectionId}/items?offset=${offset}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Page contains ${data.features ? data.features.length : 0} features`);
    
    if (data.features && data.features.length > 0) {
      allFeatures = allFeatures.concat(data.features);
      // Increment offset by 1000 for next request
      offset += 1000;
    } else {
      // No more features, end the loop
      hasMoreData = false;
    }
    
    // If we received very few features, we've likely reached the end
    if (data.features && data.features.length < 10) {
      console.log("Reached end of data (received very few items)");
      hasMoreData = false;
    }
  }
  
  if (requestCount >= maxRequests) {
    console.warn(`Reached maximum number of requests (${maxRequests}). Some data may be missing.`);
  }
  
  console.log(`Total features collected: ${allFeatures.length}`);
  
  return {
    type: "FeatureCollection",
    features: allFeatures
  };
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
