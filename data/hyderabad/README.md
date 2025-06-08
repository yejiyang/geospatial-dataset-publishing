# Hyderabad Ward Boundaries Vector Tiles

This directory is intentionally left empty in the repository. The dataset
(ward boundaries GeoJSON) and the generated Mapbox Vector Tiles are not
included in version control due to their size. Follow the steps below to
obtain and process the data yourself.

## Download the Source Data
1. Visit the [Hyderabad Ward Boundaries dataset](https://livingatlas-dcdev.opendata.arcgis.com/datasets/a090c89d52f1498f96a82e97b8bfb83e_0/about).
2. Download the dataset as **GeoJSON** and save it to:
   `data/hyderabad/greater_hyderabad_municipal_corporation_ward_Boundaries.geojson`

## Generate Vector Tiles
Use [tippecanoe](https://github.com/mapbox/tippecanoe) to create vector tiles:

```bash
tippecanoe \
  -r1 -pk -pf \
  --output-to-directory=data/tiles/ \
  --force \
  --maximum-zoom=16 \
  --extend-zooms-if-still-dropping \
  --no-tile-compression \
  data/hyderabad/greater_hyderabad_municipal_corporation_ward_Boundaries.geojson
```

This command matches the one used in the pygeoapi workshop. It generates
a directory `data/tiles/` containing zoom levels `0` through `16` and a
`metadata.json` file describing the tileset.

Once the tiles are generated, the `hyderabad` collection in
`pygeoapi/pygeoapi-config.yml` will serve them via the `MVT-tippecanoe`
provider.

