#!/bin/bash

# Function to get timestamp
get_timestamp() {
    date +"[%Y-%m-%d %H:%M:%S %z]"
}

# Check if initialization is complete
if [ -f /tmp/health/init_complete ]; then
    # Also verify the service is actually responding
    if curl -s --max-time 10 http://localhost:5000/ > /dev/null; then
        echo "$(get_timestamp) [healthcheck] Service is ready and responding"
        exit 0
    else
        echo "$(get_timestamp) [healthcheck] Service is not responding"
        exit 1
    fi
else
    echo "$(get_timestamp) [healthcheck] Initialization not complete yet"
    exit 1
fi
