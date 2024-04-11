#!/bin/bash

# Start docker containers
docker compose --progress=plain --project-directory . -f ./docker-compose.yml up -d