import geopandas as gpd
from shapely.geometry import Point
import json
import os

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, "data")

# Approximate Norway bounding box with 100km buffer
# Norway is roughly between 4°E-31°E and 57°N-71°N
# Adding ~1 degree as rough 100km buffer
norway_bbox = [3, 56, 32, 72]  # [min_lon, min_lat, max_lon, max_lat]

# Load the hazard points data
input_file = os.path.join(data_dir, "hazard_points_with_id.geojson")
output_file = os.path.join(data_dir, "points.geojson")

print(f"Loading hazard points data from {input_file}...")
try:
    with open(input_file, "r") as f:
        hazard_data = json.load(f)
except FileNotFoundError:
    print(f"Error: File not found at {input_file}")
    print("Available files in data directory:")
    if os.path.exists(data_dir):
        print(os.listdir(data_dir))
    else:
        print(f"Data directory {data_dir} does not exist")
    exit(1)

# Filter features in Norway
print("Filtering points in Norway...")
norway_features = []
for feature in hazard_data["features"]:
    lon = feature["properties"]["Longitude"]
    lat = feature["properties"]["Latitude"]
    
    if (norway_bbox[0] <= lon <= norway_bbox[2] and 
        norway_bbox[1] <= lat <= norway_bbox[3]):
        norway_features.append(feature)

# Create new GeoJSON with only Norway points
norway_geojson = {
    "type": "FeatureCollection",
    "name": "NorwayHazardPoints",
    "crs": hazard_data["crs"],
    "features": norway_features
}

# Save to points.geojson
print(f"Saving {len(norway_features)} points to {output_file}...")
os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, "w") as f:
    json.dump(norway_geojson, f)

print("Done!")