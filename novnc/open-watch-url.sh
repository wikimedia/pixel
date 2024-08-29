#!/bin/sh

# Source the .env file
. "$(dirname "$0")/../.env"

if [ -z "$PIXEL_NOVNC_PORT" ]; then
    echo "Error: PIXEL_NOVNC_PORT is not set in the .env file."
    exit 1
fi

URL="http://localhost:${PIXEL_NOVNC_PORT}/vnc_lite.html?autoconnect=true"

open "$URL" 2>/dev/null || {
    printf "\n\033[0;32mThe 'open' command is not available\033[0m\n"
    printf "\n\033[0;33mOpen the following URL in your web browser to watch BackstopJS do screen captures inside its docker container:\033[0m\n"
    printf "\n\033[1;33m%s\033[0m\n\n" "$URL"
    sleep 5
}