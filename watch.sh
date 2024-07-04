#!/bin/sh

if docker container ls --format '{{.Names}}' | grep -q "pixel-novnc-1"; then
  echo "The pixel-novnc-1 container is already running."
else
  docker compose up --no-deps --detach novnc
fi

URL="http://localhost:8088/vnc_lite.html?autoconnect=true"

open "$URL" 2>/dev/null || {
    printf "\n\033[0;31mThe 'open' command is not available.\nOpen the following URL in your web browser to watch tests execute inside the docker container:\n%s\033[0m\n" "$URL"
    sleep 5
}