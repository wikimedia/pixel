#!/bin/bash

# Update Pixel to the latest version

# Git pull the latest changes
git -C "$(dirname "$0")" pull origin main

# Install npm dependencies
npm i

# Stop and remove Docker containers, networks, and volumes
docker compose --progress plain --project-directory . -f ./docker-compose.yml down --volumes --remove-orphans

# Build the pixel-base-regression image
docker build --progress plain -f Dockerfile.base-regression -t pixel-base-regression:latest .

# Build or rebuild services
docker compose --progress plain --project-directory . -f ./docker-compose.yml build

# Remove any dangling images
docker image prune -f