/**
 * Adds Hyderabad vector tile layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addHyderabadLayer(map, apiBaseUrl = "http://localhost:5000") {
  try {
    // Ensure the apiBaseUrl has proper format (not ending with slash)
    const normalizedBaseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;

    // Add vector tiles source for Hyderabad
    map.addSource("hyderabad-source", {
      type: "vector",
      tiles: [
        `${normalizedBaseUrl}/collections/hyderabad/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
      ],
      minzoom: 0,
      maxzoom: 16,
      bounds: [78.23792, 17.290806, 78.621705, 17.561844],
    });

    // Add Hyderabad layer
    map.addLayer({
      id: "hyderabad-layer",
      type: "fill",
      source: "hyderabad-source",
      "source-layer": "greater_hyderabad_municipal_corporation_ward_Boundaries",
      layout: {},
      paint: {
        "fill-color": "#3388ff",
        "fill-opacity": 0.4,
        "fill-outline-color": "#0066aa",
      },
    });

    // Add outline layer for better visibility
    map.addLayer({
      id: "hyderabad-outline",
      type: "line",
      source: "hyderabad-source",
      "source-layer": "greater_hyderabad_municipal_corporation_ward_Boundaries",
      layout: {},
      paint: {
        "line-color": "#0066aa",
        "line-width": 1,
      },
    });

    // Add click interaction for Hyderabad features
    map.on("click", "hyderabad-layer", (e) => {
      const properties = e.features[0].properties;

      // Create table of properties with special formatting for key fields
      let html = '<h3>Hyderabad Ward</h3><table style="width:100%">';

      // Display important fields first
      if (properties.ward_lgd_name) {
        html += `<tr><td><strong>Ward Name</strong></td><td>${properties.ward_lgd_name}</td></tr>`;
      }
      if (properties.townname) {
        html += `<tr><td><strong>Town</strong></td><td>${properties.townname}</td></tr>`;
      }
      if (properties.state) {
        html += `<tr><td><strong>State</strong></td><td>${properties.state}</td></tr>`;
      }

      // Add other properties
      for (const [key, value] of Object.entries(properties)) {
        if (
          !["ward_lgd_name", "townname", "state"].includes(key) &&
          key !== "id" &&
          key !== "fid"
        ) {
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
    map.on("mouseenter", "hyderabad-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "hyderabad-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    // Add button to fly to Hyderabad
    addHyderabadButton(map);

    console.log("Hyderabad layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Hyderabad layer:", error);
    return false;
  }
}

/**
 * Adds a button to fly to Hyderabad
 * @param {Object} map - The MapLibre GL JS map instance
 */
function addHyderabadButton(map) {
  const hyderabadButton = document.createElement("button");
  hyderabadButton.textContent = "Fly to Hyderabad";
  hyderabadButton.style.position = "absolute";
  hyderabadButton.style.bottom = "10px";
  hyderabadButton.style.left = "10px";
  hyderabadButton.style.padding = "8px";
  hyderabadButton.style.borderRadius = "4px";
  hyderabadButton.style.backgroundColor = "#3388ff";
  hyderabadButton.style.color = "white";
  hyderabadButton.style.border = "none";
  hyderabadButton.style.cursor = "pointer";

  hyderabadButton.addEventListener("click", () => {
    map.flyTo({
      center: [78.483582, 17.426649],
      zoom: 10,
      essential: true,
    });
  });

  document.body.appendChild(hyderabadButton);
}
