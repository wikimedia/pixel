#!/bin/bash

# IMPORTANT: Any local dependency listed here MUST have a `COPY` command in
# Dockerfile.mediawiki before this file is executed.

# Reminder: can use this when debugging this file:
#    docker compose --progress=plain build mediawiki
# It's faster than doing docker compose up since it limits itself to the mediawiki image which uses this file

set -eu

REPOSITORIES_JSON="$1"

get_default_branch() {
    local path=$1
    git -C "${path}" symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
}

setup_repo() {
    echo -e "\n\nSetting up $id"
    local id=$1
    local path=$2
    if ! git clone "https://gerrit.wikimedia.org/r/${id}" "${path}" --progress; then
        echo "Failed to clone '${id}' repository"
        exit 1
    fi
    git -C "${path}" checkout --progress "$(get_default_branch "$path")"
    if [ -e "$(pwd)/${path}/composer.json" ]; then
      echo -e "\nRunning composer install for $path..."
      local composer_output=$(composer install --working-dir="${path}" --no-dev -n 2>&1) || {
          echo -e "${id} Composer install failed with output:\n${composer_output}"
          exit 1
      }
      echo -e "\e[32mSuccess!\e[0m"
    fi
    if [ -e "${path}/.gitmodules" ]; then
        echo "Git submodule update: ${path}"
        git -C "${path}" submodule update --init
    fi
}

setup_core() {
    echo -e "\nSetting up mediawiki/core"
    local core_git='https://gerrit.wikimedia.org/r/mediawiki/core.git'
    if ! git clone "${core_git}" . --progress; then
        echo "Failed to clone the repository from '${core_git}'"
        exit 1
    fi
    git checkout --progress "$(get_default_branch ".")"
    echo -e "\nRunning composer install for Mediawiki Core..."
    local composer_output=$(composer install --no-dev -n 2>&1) || {
        echo -e "Mediawiki Core Composer install failed with output:\n${composer_output}"
        exit 1
    }
    echo -e "\e[32mSuccess!\e[0m"
}

setup_repos() {
  echo -e "\n$REPOSITORIES_JSON" | python3 -c "\
import sys, json; \
[print(key, value['path']) \
for key, value in json.load(sys.stdin).items() \
if key != 'mediawiki/core']" | \
  while read -r id path; do
      setup_repo "$id" "$path"
      sleep 1
  done
}

start_time=$(date +%s)

setup_core
sleep 1
setup_repos

end_time=$(date +%s)

echo -e "\nFinished in $((end_time - start_time)) seconds"
