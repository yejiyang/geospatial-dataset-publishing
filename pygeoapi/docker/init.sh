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

# Check Application Insights configuration
if [ -n "$APPLICATIONINSIGHTS_CONNECTION_STRING" ]; then
    echo "$(get_timestamp) [init] Application Insights connection string found, enabling telemetry"
    export PYTHONPATH="/appinsights_init.py:$PYTHONPATH"
else
    echo "$(get_timestamp) [init] No Application Insights connection string found, running without telemetry"
fi

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

# Start pygeoapi with Application Insights if configured
if [ -n "$APPLICATIONINSIGHTS_CONNECTION_STRING" ]; then
    echo "$(get_timestamp) [init] Starting pygeoapi service with Application Insights"

    # First, generate the OpenAPI document that pygeoapi needs
    echo "$(get_timestamp) [init] Generating OpenAPI document"
    pygeoapi openapi generate /pygeoapi/local.config.yml --output-file /tmp/openapi.yml

    # Create a startup script that integrates Application Insights
    cat > /tmp/start_with_insights.py << 'EOF'
import os
import sys

# Add root to Python path to import appinsights_init
sys.path.insert(0, '/')

try:
    import appinsights_init
    print("[start_with_insights] Application Insights module loaded")

    # Import prebuilt Flask app instance
    from pygeoapi.flask_app import APP as app
    print("[start_with_insights] Flask app imported successfully")

    # Setup Application Insights telemetry
    appinsights_init.setup_app_insights(app)
    print("[start_with_insights] Application Insights integrated")

except ImportError as e:
    print(f"[start_with_insights] ImportError: {e}")
    sys.exit(1)

except Exception as e:
    print(f"[start_with_insights] Error during telemetry setup: {e}")
    import traceback
    traceback.print_exc()

# Run the app (development mode only)
if __name__ == '__main__':
    print("[start_with_insights] Starting Flask app")
    app.run(host='0.0.0.0', port=5000)

EOF

    # Execute the Application Insights setup (but don't start the app yet)
    python3 /tmp/start_with_insights.py

else
    echo "$(get_timestamp) [init] Starting pygeoapi service without Application Insights"
    echo "$(get_timestamp) [init] Generating OpenAPI document"
    pygeoapi openapi generate /pygeoapi/local.config.yml --output-file /tmp/openapi.yml
    # Start the pygeoapi service
    echo "$(get_timestamp) [init] Starting pygeoapi service"
    exec /entrypoint.sh "$@"
fi
