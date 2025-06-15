# Global Hazard Points Vector Tiles

This directory contains instructions for generating the FlatGeobuf file and vector
tiles used by the `hazard_points_fgb` collection in `pygeoapi`.

The raw GeoJSON source `data/hazard/global-hazard-points.geojson` is quite large and
should ideally be kept out of version control.

## Generate the FlatGeobuf

You no longer need a local GDAL installation. Run the helper target which
launches a lightweight GDAL container under the hood:

```bash
make hazard-fgb  # invokes docker-run gdal → FlatGeobuf
```

## Generate Vector Tiles

Vector tile generation is performed with a Dockerised build of
[tippecanoe](https://github.com/mapbox/tippecanoe); simply run:

```bash
make hazard-tiles  # containerised tippecanoe builds MVT tiles
```

This produces the directory `data/tiles/global-hazard/` containing zoom levels
`0` – `15` plus a `metadata.json` file. Once generated, the tiles are served by
pygeoapi using the `MVT-tippecanoe` provider defined in
`pygeoapi/pygeoapi-config.yml`.
