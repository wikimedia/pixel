#!/usr/bin/env bash

# Update core, extensions, and skins.
time for i in . extensions/*/ skins/*/; do
  git -C "$i" checkout $BRANCH &&
  git -C "$i" reset --hard &&
  git -C "$i" pull &
done

wait
time for i in . extensions/*/ skins/*/; do
  composer install --working-dir="$i" --no-dev &
done

wait
# Update the database schema.
php maintenance/update.php --quick
