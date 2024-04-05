#!/bin/bash

# Removes all images, containers, networks, and volumes associated with Pixel.
# This will often be used after updates to the Docker images and/or volumes and
# will reset everything so that Pixel starts with a clean slate.

# Stop and remove Docker containers, networks, and volumes
docker compose --progress=plain --project-directory . -f ./docker-compose.yml down --rmi all --volumes --remove-orphans

# Remove other images and intermediate build artifacts
docker system prune -af