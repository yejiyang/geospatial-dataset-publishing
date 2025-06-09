// Add this function to your code to add the global hazard points layer

/**
 * Adds Global Hazard Points vector tile layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addGlobalHazardTiles(map, apiBaseUrl = "http://localhost:5000") {
  try {
    // Add vector tiles source for Global Hazard Points
    map.addSource("global-hazard-source", {
      type: "vector",
      tiles: [
        `${apiBaseUrl}/collections/hazardglobal/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
      ],
      minzoom: 0,
      maxzoom: 15,
      bounds: [-180, -90, 180, 90], // Global bounds
    });

    // Add Global Hazard Points layer
    map.addLayer({
      id: "hazard-pt", // Using the ID you mentioned
      type: "circle",
      source: "global-hazard-source",
      "source-layer": "hazard_points_with_id", // Make sure this matches the layer name in your vector tiles
      layout: {
        visibility: "visible", // Explicitly set to visible
      },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 8],
        "circle-color": "#1e88e5", // Different color from Norway layer
        "circle-opacity": 0.8,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Add click interaction for Global Hazard Points features
    map.on("click", "hazard-pt", (e) => {
      const properties = e.features[0].properties;
      const featureId = properties.id || Date.now();

      // Build table rows
      let rows = "";
      for (const [key, value] of Object.entries(properties)) {
        if (key !== "id" && key !== "fid") {
          rows += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
      }

      const canvasId = `rate-chart-${featureId}`;
      const downloadId = `download-${featureId}`;

      const html = `
        <div class="hazard-popup">
          <h3>Global Hazard Point</h3>
          <table class="popup-table">${rows}</table>
          <canvas id="${canvasId}" height="160"></canvas>
          <button class="download-btn" id="${downloadId}">Download CSV</button>
        </div>`;

      new maplibregl.Popup({
        maxWidth: "600px",
        className: "chart-popup",
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);

      // Create bar chart of rate_* properties
      const rateKeys = [
        "rate_5",
        "rate_10",
        "rate_25",
        "rate_50",
        "rate_100",
        "rate_300",
        "rate_500",
        "rate_1000",
        "rate_2000",
      ];
      const rateValues = rateKeys.map((k) => Number(properties[k] || 0));
      const ctx = document.getElementById(canvasId).getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: rateKeys.map((k) => k.replace("rate_", "")),
          datasets: [
            {
              label: "Rate",
              data: rateValues,
              backgroundColor: "rgba(30, 136, 229, 0.6)",
            },
          ],
        },
        options: {
          responsive: false,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });

      // Attach CSV download handler
      document.getElementById(downloadId).addEventListener("click", () => {
        const header = Object.keys(properties).join(",");
        const values = Object.values(properties).join(",");
        const csv = `${header}\n${values}`;
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `hazard_point_${featureId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });
    });

    // Set cursor style on feature hover
    map.on("mouseenter", "hazard-pt", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "hazard-pt", () => {
      map.getCanvas().style.cursor = "";
    });

    console.log("Global Hazard Points layer added successfully");
    return true;
  } catch (error) {
    console.error("Failed to add Global Hazard Points layer:", error);
    return false;
  }
}
