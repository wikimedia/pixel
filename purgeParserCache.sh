#!/bin/bash

set -eux

echo "Purging parser cache..."
docker compose --progress=plain --project-directory . -f ./docker-compose.yml exec mediawiki php maintenance/run.php purgeParserCache.php --age 1
