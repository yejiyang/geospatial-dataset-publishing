FROM python:3.13-slim

# Install pygeoapi and GDAL bindings
RUN apt-get update && apt-get install -y gdal-bin && \
    pip install --no-cache-dir pygeoapi gunicorn flask-cors

# Copy config and data
COPY pygeoapi-config.yml /etc/pygeoapi.yml
RUN pygeoapi openapi generate /etc/pygeoapi.yml --output-file /etc/openapi.yml
ENV PYGEOAPI_OPENAPI=/etc/openapi.yml

ENV PYGEOAPI_CONFIG=/etc/pygeoapi.yml
EXPOSE 5000

# Increased timeout to 120 seconds and using flask_app:APP
CMD ["gunicorn", "--timeout", "120", "-w", "2", "-b", "0.0.0.0:5000", "pygeoapi.flask_app:APP"]
