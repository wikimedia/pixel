#!/bin/bash

# Stop all Docker containers associated with Pixel
docker compose --progress=plain --project-directory . -f ./docker-compose.yml stop