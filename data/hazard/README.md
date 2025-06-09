# Global Hazard Points Vector Tiles

This directory contains instructions for generating the FlatGeobuf file and vector
tiles used by the `hazard_points_fgb` collection in `pygeoapi`.

The raw GeoJSON source `data/hazard/global-hazard-points.geojson` is quite large and
should ideally be kept out of version control.

## Generate the FlatGeobuf
Convert the GeoJSON to FlatGeobuf for efficient serving:

```bash
ogr2ogr -f FlatGeobuf \
  data/hazard/global-hazard-points.fgb \
  data/hazard/global-hazard-points.geojson -nln GlobalHazardPoints
```

## Generate Vector Tiles
Create Mapbox Vector Tiles with [tippecanoe](https://github.com/mapbox/tippecanoe):

```bash
tippecanoe \
  -r1 -pk -pf \
  --output-to-directory=data/tiles/hazard_points/ \
  --force \
  --maximum-zoom=15 \
  --extend-zooms-if-still-dropping \
  --no-tile-compression \
  data/hazard/global-hazard-points.geojson
```

This produces a directory `data/tiles/hazard_points/` containing zoom levels `0`
through `15` and a `metadata.json` file. Once generated, the tiles are served by
pygeoapi using the `MVT-tippecanoe` provider defined in `pygeoapi/pygeoapi-config.yml`.
