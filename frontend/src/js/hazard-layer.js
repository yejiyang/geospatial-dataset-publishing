// Add this function to your code to add the global hazard points layer

/**
 * Adds Global Hazard Points vector tile layers to the map
 * @param {Object} map - The MapLibre GL JS map instance
 * @param {string} apiBaseUrl - The base URL for the API
 */
function addGlobalHazardTiles(map, apiBaseUrl = "http://localhost:5000") {
  try {
    // Ensure the apiBaseUrl has proper format (not ending with slash)
    const normalizedBaseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;

    // Add vector tiles source for Global Hazard Points
    map.addSource("global-hazard-source", {
      type: "vector",
      tiles: [
        `${normalizedBaseUrl}/collections/hazardglobal/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt`,
      ],
      minzoom: 0,
      maxzoom: 15,
      bounds: [-180, -90, 180, 90], // Global bounds
    });

    // Add Global Hazard Points layer with zoom-based styling for better performance
    map.addLayer({
      id: "hazard-pt", // Using the ID you mentioned
      type: "circle",
      source: "global-hazard-source",
      "source-layer": "globalhazardpoints", // Make sure this matches the layer name in your vector tiles
      layout: {
        visibility: "visible", // Explicitly set to visible
      },
      paint: {
        // Dynamic sizing based on zoom level for better visibility
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1, // At zoom 0, very small dots
          5,
          2, // At zoom 5, small dots
          10,
          4, // At zoom 10, medium dots
          15,
          8, // At zoom 15, larger dots
        ],
        // Color based on hazard severity if available, otherwise use default
        "circle-color": [
          "case",
          ["has", "ari500"],
          [
            "interpolate",
            ["linear"],
            ["get", "ari500"],
            0,
            "#4CAF50", // Green for low risk
            5,
            "#FFC107", // Yellow for medium risk
            10,
            "#FF9800", // Orange for high risk
            20,
            "#F44336", // Red for very high risk
          ],
          "#1a73e8", // Default blue color
        ],
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.6,
          10,
          0.8,
          15,
          0.9,
        ],
        "circle-stroke-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0,
          10,
          0.5,
          15,
          1,
        ],
        "circle-stroke-color": "#ffffff",
      },
    });

    // Global variable to track current popup for ESC key functionality
    let currentPopup = null;

    // Add ESC key event listener for closing popups
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    });

    // Add click interaction for Global Hazard Points features
    map.on("click", "hazard-pt", (e) => {
      // Close existing popup if any
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }

      const properties = e.features[0].properties;
      const featureId = properties.id || Date.now();

      // Build limited properties table (first 7 items)
      const propertyEntries = Object.entries(properties).filter(
        ([key]) => key !== "id" && key !== "fid"
      );
      const visibleProperties = propertyEntries.slice(0, 7);
      const hiddenProperties = propertyEntries.slice(7);

      let visibleRows = "";
      let hiddenRows = "";

      visibleProperties.forEach(([key, value]) => {
        visibleRows += `<tr><td>${key}</td><td>${value}</td></tr>`;
      });

      hiddenProperties.forEach(([key, value]) => {
        hiddenRows += `<tr><td>${key}</td><td>${value}</td></tr>`;
      });

      const canvasId = `rate-chart-${featureId}`;
      const downloadId = `download-${featureId}`;

      const html = `
        <div class="hazard-popup">
          <h3>Global Hazard Point</h3>
          <canvas id="${canvasId}" width="400" height="160"></canvas>
          <button class="download-btn" id="${downloadId}">Download CSV</button>
          <details class="properties-details">
            <summary>Properties (${propertyEntries.length} total)</summary>
            <div class="properties-content">
              <div class="properties-scroll-container">
                <table class="popup-table">
                  ${visibleRows}
                  ${hiddenRows}
                </table>
              </div>
            </div>
          </details>
          <div class="popup-hint">💡 Press <kbd>ESC</kbd> to close this popup</div>
        </div>`;

      // Create popup with improved configuration to prevent jumping
      currentPopup = new maplibregl.Popup({
        maxWidth: "480px",
        className: "chart-popup",
        closeOnClick: false,
        closeOnMove: false,
        anchor: "bottom", // Anchor to bottom to prevent jumping
        offset: [0, -10], // Small offset from the point
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);

      // Handle popup close event to reset currentPopup
      currentPopup.on("close", () => {
        currentPopup = null;
      });

      // Adjust popup position if it goes off screen
      setTimeout(() => {
        const popupElement = currentPopup.getElement();
        if (popupElement) {
          const rect = popupElement.getBoundingClientRect();
          const mapContainer = map.getContainer().getBoundingClientRect();

          // Check if popup extends beyond screen boundaries
          if (rect.right > mapContainer.right) {
            currentPopup.setOffset([-rect.width / 2, -10]);
          }
          if (rect.left < mapContainer.left) {
            currentPopup.setOffset([rect.width / 2, -10]);
          }
          if (rect.top < mapContainer.top) {
            currentPopup.setOffset([0, 10]);
          }
        }
      }, 50);

      // Create line chart of ARI runup heights
      const ariKeys = [
        "ari10",
        "ari50",
        "ari100",
        "ari200",
        "ari500",
        "ari1000",
        "ari2500",
      ];

      const datasets = [
        {
          label: "Runup height (m)",
          data: ariKeys.map((k) => ({
            x: Number(k.replace("ari", "")),
            y: Number(properties[k] || 0),
          })),
          borderColor: "#1a73e8",
          backgroundColor: "rgba(26, 115, 232, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#1a73e8",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          parsing: false,
        },
      ];

      const variants = [
        ["ari500LL", "σ=0.5", "#FF9800"],
        ["ari500ZL", "σ=0.0", "#4CAF50"],
        ["ari500M", "Lower 95%", "#F44336"],
        ["ari500P", "Upper 95%", "#9C27B0"],
      ];

      variants.forEach(([key, label, color]) => {
        if (properties[key] !== undefined) {
          datasets.push({
            label,
            data: [{ x: 500, y: Number(properties[key]) }],
            showLine: false,
            pointRadius: 5,
            pointBackgroundColor: color,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            parsing: false,
          });
        }
      });

      // Wait for canvas to be in DOM before creating chart
      setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
          const ctx = canvas.getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: { datasets },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    usePointStyle: true,
                    padding: 12,
                    font: {
                      size: 11,
                    },
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  titleColor: "white",
                  bodyColor: "white",
                },
              },
              scales: {
                x: {
                  type: "linear",
                  title: {
                    display: true,
                    text: "Return period (years)",
                    font: { size: 12 },
                  },
                  ticks: {
                    stepSize: 500,
                    font: { size: 11 },
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Runup height (m)",
                    font: { size: 12 },
                  },
                  ticks: {
                    font: { size: 11 },
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                },
              },
            },
          });
        }
      }, 100);

      // Attach CSV download handler
      setTimeout(() => {
        const downloadBtn = document.getElementById(downloadId);
        if (downloadBtn) {
          downloadBtn.addEventListener("click", () => {
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
        }
      }, 100);

      // Handle properties details expansion to prevent popup jumping
      setTimeout(() => {
        const detailsElement = currentPopup
          .getElement()
          .querySelector(".properties-details");
        if (detailsElement) {
          detailsElement.addEventListener("toggle", (e) => {
            // Small delay to allow content to render
            setTimeout(() => {
              const popupElement = currentPopup.getElement();
              const rect = popupElement.getBoundingClientRect();
              const mapContainer = map.getContainer().getBoundingClientRect();

              // Adjust popup position if it goes beyond screen after expansion
              if (rect.bottom > mapContainer.bottom) {
                // Move popup up if it goes below screen
                const newOffset = [0, -(rect.height + 20)];
                currentPopup.setOffset(newOffset);
              }

              // Ensure popup doesn't go off the sides
              if (rect.right > mapContainer.right) {
                currentPopup.setOffset([
                  -rect.width / 2,
                  currentPopup.getOffset()[1],
                ]);
              }
              if (rect.left < mapContainer.left) {
                currentPopup.setOffset([
                  rect.width / 2,
                  currentPopup.getOffset()[1],
                ]);
              }
            }, 50);
          });
        }
      }, 100);
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
