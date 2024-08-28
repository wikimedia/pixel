#!/bin/bash

# Stop all Docker containers associated with Pixel
docker compose --progress=plain --project-directory . -f ./docker-compose.yml stop

# Started this one detached so have to bring it down separately
docker compose stop novnc || true