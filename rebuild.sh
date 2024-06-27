#!/bin/bash

set -e

# Stop and remove Docker containers, networks, and volumes
./clean.sh 2>&1

# Build the pixel-base-regression image
./build-base-regression-image.sh 2>&1

# Build or rebuild services
docker compose --progress=plain --project-directory . -f ./docker-compose.yml build 2>&1

# Remove any dangling images
docker image prune -f 2>&1