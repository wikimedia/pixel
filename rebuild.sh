#!/bin/bash

set -e

# Stop and remove Docker containers, networks, and volumes
./clean.sh

# Build the pixel-base-regression image
./build-base-regression-image.sh

# Build or rebuild services
docker compose --progress=plain --project-directory . -f ./docker-compose.yml build

# Remove any dangling images
docker image prune -f
