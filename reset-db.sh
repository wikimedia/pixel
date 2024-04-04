#!/bin/bash

# Reset the database to the physical backup

# Stop the MySQL server
docker compose --progress plain --project-directory . -f ./docker-compose.yml stop database

# Run seedDb.sh script to rsync the physical backup into the MySQL folder
docker compose --progress plain --project-directory . -f ./docker-compose.yml run --rm --entrypoint "bash -c '/docker-entrypoint-initdb.d/seedDb.sh'" database

# Start the MySQL server
docker compose --progress plain --project-directory . -f ./docker-compose.yml up -d database