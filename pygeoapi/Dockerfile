FROM python:3.13-slim

# Install pygeoapi and GDAL bindings (more complete installation)
RUN apt-get update && \
    apt-get install -y gdal-bin libgdal-dev build-essential python3-dev && \
    pip install --no-cache-dir pygeoapi gunicorn flask-cors && \
    pip install --no-cache-dir GDAL==$(gdal-config --version)

# Create data directory
RUN mkdir -p /data

# Copy config 
COPY pygeoapi-config.yml /etc/pygeoapi.yml

# Modify paths in config to use absolute paths
RUN sed -i 's|../data|/data|g' /etc/pygeoapi.yml

# Generate OpenAPI spec in a separate step (will be run after container starts)
ENV PYGEOAPI_OPENAPI=/etc/openapi.yml
ENV PYGEOAPI_CONFIG=/etc/pygeoapi.yml
EXPOSE 5000

# Create startup script
RUN echo '#!/bin/bash\n\
# Generate OpenAPI spec if not exists\n\
if [ ! -f /etc/openapi.yml ]; then\n\
  echo "Generating OpenAPI specification..."\n\
  pygeoapi openapi generate /etc/pygeoapi.yml --output-file /etc/openapi.yml || true\n\
fi\n\
# Start gunicorn\n\
exec gunicorn --timeout 120 -w 2 -b 0.0.0.0:5000 pygeoapi.flask_app:APP\n' > /start.sh && \
chmod +x /start.sh

CMD ["/start.sh"]
