#!/bin/bash

git config --global user.email "you@example.com"
git config --global user.name "Your Name"

# Update core, extensions, and skins.
time for i in . extensions/*/ skins/*/; do
  echo "************Updating $i************"
  git -C "$i" fetch --depth=1
  git -C "$i" reset --hard origin
  composer --working-dir="$i" install --no-dev 
done


# Update the database schema.
php maintenance/update.php
