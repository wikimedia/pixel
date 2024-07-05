#!/bin/bash

# Start docker containers
docker compose --progress=plain --project-directory . -f ./docker-compose.yml up -d

# Start novnc container if needed
if [ "${WATCH_MODE}" = "1" ]; then
  ./novnc/ensure-novnc-container-up.sh
fi