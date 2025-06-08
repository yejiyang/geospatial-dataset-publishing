// Function to add points layer to the map
async function addPointsLayer(map, apiBaseUrl) {
  // Fetch all points
  const pointsData = await fetchAllPoints(apiBaseUrl);
  
  // Add source
  map.addSource('pts', {
    type: 'geojson',
    data: pointsData
  });
  
  // Add layer
  map.addLayer({
    id: 'pt', 
    type: 'circle', 
    source: 'pts',
    paint: {
      'circle-radius': 5, 
      'circle-color': '#FF0000', 
      'circle-stroke-width': 1, 
      'circle-stroke-color': '#FFFFFF'
    }
  });
}

// Function to fetch all regular points
async function fetchAllPoints(apiBaseUrl) {
  let allFeatures = [];
  let nextLink = `${apiBaseUrl}/collections/points/items?f=json&limit=100`;
  
  while (nextLink) {
    const response = await fetch(nextLink);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      allFeatures = allFeatures.concat(data.features);
    }
    
    nextLink = null;
    if (data.links) {
      const nextLinkObj = data.links.find(link => link.rel === 'next');
      if (nextLinkObj) {
        nextLink = nextLinkObj.href;
      }
    }
  }
  
  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
}