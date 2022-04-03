#!/usr/bin/env bash

git config --global user.email "you@example.com"
git config --global user.name "Your Name"

# Update core, extensions, and skins.
time for i in . extensions/*/ skins/*/; do
  git -C "$i" pull &
done

wait
time for i in . extensions/*/ skins/*/; do
  composer install --working-dir="$i" --no-dev &
done

wait
# Update the database schema.
php maintenance/update.php --quick
