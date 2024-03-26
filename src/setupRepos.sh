#!/bin/bash

# IMPORTANT: Any local dependency listed here MUST have a `COPY` command in
# Dockerfile.mediawiki before this file is executed.

# For faster debugging this builds only the image using this file:
#    docker compose --progress=plain build mediawiki

set -eu

REPOSITORIES_JSON="$1"

GIT_CLONE_MAX_RETRIES=5

CORE_CLONE_TIMEOUT=$((60 * 10)) # 10 minutes before retrying

NON_CORE_CLONE_TIMEOUT=$((60 * 3)) # 3 minutes before retrying

get_default_branch() {
  local path=$1
  git -C "${path}" symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
}

clone_with_retries() {
  local repo_url=$1
  local clone_path=$2
  local max_retries=${3:-3}
  local clone_timeout=${4:-600}  # Timeout in seconds, default 10 minutes
  local attempt=1
  while [ $attempt -le $max_retries ]; do
    echo "Cloning '${repo_url}', attempt $attempt of $max_retries, with a timeout of $clone_timeout seconds before forcing a retry"
    if [ -d "${clone_path}" ]; then
      find "${clone_path}" -mindepth 1 -delete
    fi
    if timeout $clone_timeout git clone "${repo_url}" "${clone_path}" --progress; then
      return 0
    else
      echo "Attempt $attempt to clone '${repo_url}' failed"
      attempt=$((attempt+1))
      sleep 5
    fi
  done
  echo "Failed to clone '${repo_url}' after $max_retries attempts"
  return 1
}

setup_repo() {
  local id=$1
  echo -e "\n\nSetting up $id"
  local path=$2
  if ! clone_with_retries "https://gerrit.wikimedia.org/r/${id}" "${path}" $GIT_CLONE_MAX_RETRIES $NON_CORE_CLONE_TIMEOUT; then
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
  if ! clone_with_retries "${core_git}" . $GIT_CLONE_MAX_RETRIES $CORE_CLONE_TIMEOUT; then
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
if key != 'mediawiki/core']" |
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

echo -e "\nFinished setupRepos.sh in $((end_time - start_time)) seconds"
