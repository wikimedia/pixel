#!/bin/sh

if docker container ls --format '{{.Names}}' | grep -q "pixel-novnc-1"; then
  echo "The pixel-novnc-1 container is already running."
else
  docker compose up --no-deps --detach novnc
fi