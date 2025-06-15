/**
 * Adds Norway Hazard Points vector tile layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addNorwayHazardTiles(map, apiBaseUrl = "http://localhost:5000") {
  try {
    // Ensure the apiBaseUrl has proper format (not ending with slash)
    const normalizedBaseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;

    // Add vector tiles source for Norway Hazard Points
    map.addSource("norway-hazard-source", {
      type: "vector",
      tiles: [
        `${normalizedBaseUrl}/collections/points/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
      ],
      minzoom: 0,
      maxzoom: 15,
      bounds: [3, 56, 32, 72], // Norway with 100km buffer
    });

    // Add Norway Hazard Points layer
    map.addLayer({
      id: "norway-hazard-layer",
      type: "circle",
      source: "norway-hazard-source",
      "source-layer": "points",
      layout: {},
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 8],
        "circle-color": "#ff4500",
        "circle-opacity": 0.8,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Add click interaction for Norway Hazard Points features
    map.on("click", "norway-hazard-layer", (e) => {
      const properties = e.features[0].properties;

      // Create table of properties
      let html = '<h3>Norway Hazard Tiles</h3><table style="width:100%">';

      // Display all properties
      for (const [key, value] of Object.entries(properties)) {
        if (key !== "id" && key !== "fid") {
          html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
        }
      }
      html += "</table>";

      new maplibregl.Popup({
        maxWidth: "500px",
        className: "chart-popup",
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    // Set cursor style on feature hover
    map.on("mouseenter", "norway-hazard-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "norway-hazard-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    // Add button to fly to Norway
    addNorwayButton(map);

    console.log("Norway Hazard Points layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Norway Hazard Points layer:", error);
    return false;
  }
}

/**
 * Adds a button to fly to Norway
 * @param {Object} map - The MapLibre GL JS map instance
 */
function addNorwayButton(map) {
  const norwayButton = document.createElement("button");
  norwayButton.textContent = "Fly to Norway (Tiles)";
  norwayButton.style.position = "absolute";
  norwayButton.style.bottom = "50px"; // Position it above the Hyderabad button
  norwayButton.style.left = "10px";
  norwayButton.style.padding = "8px";
  norwayButton.style.borderRadius = "4px";
  norwayButton.style.backgroundColor = "#ff4500";
  norwayButton.style.color = "white";
  norwayButton.style.border = "none";
  norwayButton.style.cursor = "pointer";

  norwayButton.addEventListener("click", () => {
    map.flyTo({
      center: [10.7522, 59.9139], // Oslo coordinates
      zoom: 5,
      essential: true,
    });
  });

  document.body.appendChild(norwayButton);
}
