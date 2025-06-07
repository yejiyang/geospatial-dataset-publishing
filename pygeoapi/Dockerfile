FROM python:3.13-slim

# Install pygeoapi and GDAL bindings
RUN apt-get update && apt-get install -y gdal-bin && \
    pip install --no-cache-dir pygeoapi[all]

# Copy config and data
COPY pygeoapi-config.yml /etc/pygeoapi.yml

ENV PYGEOAPI_CONFIG=/etc/pygeoapi.yml
EXPOSE 5000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "pygeoapi.openapi:app"]
