#!/bin/bash
set -e

# Generate hazard vector tiles if missing
if [ ! -d /data/tiles/global-hazard ]; then
    echo "[init] Generating hazard vector tiles"
    mkdir -p /data/tiles/global-hazard
    tippecanoe -r1 -pk -pf \
        --output-to-directory=/data/tiles/global-hazard/ \
        --force --maximum-zoom=15 \
        --extend-zooms-if-still-dropping \
        --no-tile-compression \
        /data/hazard/global-hazard-points.geojson
fi

exec /entrypoint.sh "$@"
