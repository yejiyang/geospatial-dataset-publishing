#!/bin/bash
set -e

# Function to get timestamp
get_timestamp() {
    date +"[%Y-%m-%d %H:%M:%S %z]"
}

echo "$(get_timestamp) [init] Starting initialization process"

# Print version information
if [ -f /VERSION ]; then
    VERSION=$(cat /VERSION)
    echo "$(get_timestamp) [init] Container version: $VERSION"
else
    echo "$(get_timestamp) [init] VERSION file not found"
fi

# Get pygeoapi version
PYGEOAPI_VERSION=$(pygeoapi --version 2>&1)
echo "$(get_timestamp) [init] PyGeoAPI version: $PYGEOAPI_VERSION"

# Remove any existing readiness indicator
rm -f /tmp/health/init_complete
echo "$(get_timestamp) [init] Removed any existing readiness indicators"

# Generate hazard vector tiles if missing
if [ ! -d /data/tiles/global-hazard ]; then
    echo "$(get_timestamp) [init] Generating hazard vector tiles - this may take several minutes"
    mkdir -p /data/tiles/global-hazard
    tippecanoe -r1 -pk -pf \
        --output-to-directory=/data/tiles/global-hazard/ \
        --force --maximum-zoom=15 \
        --extend-zooms-if-still-dropping \
        --no-tile-compression \
        /data/hazard/global-hazard-points.geojson
    echo "$(get_timestamp) [init] Finished generating hazard vector tiles"
else
    echo "$(get_timestamp) [init] Hazard vector tiles already exist, skipping generation"
fi

# Mark initialization as complete
mkdir -p /tmp/health
touch /tmp/health/init_complete
echo "$(get_timestamp) [init] Initialization complete"

# Start the pygeoapi service
echo "$(get_timestamp) [init] Starting pygeoapi service"
exec /entrypoint.sh "$@"
