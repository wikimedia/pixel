#!/bin/bash

# For faster debugging this builds only the image using this file:
#    docker compose --progress=plain build mediawiki

set -eu

REPOSITORIES_JSON="$1"

get_default_branch() {
  local path=$1
  git -C "${path}" symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
}


clone_with_retries() {
  local repo_url=$1
  local clone_path=$2
  local max_retries=${3:-3}
  local clone_timeout=${4:-600}  # Timeout in seconds, default 10 minutes
  local depth=${5:-}
  local attempt=1
  local depth_flag=""
  if [ -n "$depth" ]; then
    depth_flag="--depth $depth"
  fi
  while [ $attempt -le $max_retries ]; do
    echo -e "\n\033[32mCloning '${repo_url}', attempt $attempt of $max_retries, with a timeout of $clone_timeout seconds before forcing a retry (clone depth: ${depth:-full})\033[0m\n"
    if [ -d "${clone_path}" ]; then
      find "${clone_path}" -mindepth 1 -delete
    fi
    if timeout $clone_timeout git clone $depth_flag "${repo_url}" "${clone_path}" --progress; then
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
  local max_retries=5
  local timeout_seconds=$((60 * 3)) # 3 minutes before retrying
  if ! clone_with_retries "https://gerrit.wikimedia.org/r/${id}" "${path}" $max_retries $timeout_seconds "${CLONE_DEPTH:-}"; then
    exit 1
  fi
  git -C "${path}" checkout --progress "$(get_default_branch "$path")"
  if [ -e "${path}/.gitmodules" ]; then
    echo "Git submodule update: ${path}"
    git -C "${path}" submodule update --init
  fi
}

setup_core() {
  echo -e "\nSetting up mediawiki/core"
  local core_git='https://gerrit.wikimedia.org/r/mediawiki/core.git'
  local max_retries=5
  local timeout_seconds=$((60 * 10)) # 10 minutes before retrying
  if ! clone_with_retries "${core_git}" . $max_retries $timeout_seconds "${CLONE_DEPTH:-}"; then
    echo "Failed to clone the repository from '${core_git}'"
    exit 1
  fi
  git checkout --progress "$(get_default_branch ".")"
  echo -e "\e[32mSuccess!\e[0m"
}

install_php_dependencies() {
  echo -e "\nRunning composer install for Mediawiki Core, extensions and skins..."
  mv ./composer.local.json-sample ./composer.local.json
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
sleep 1
install_php_dependencies

end_time=$(date +%s)

echo -e "\nFinished setupRepos.sh in $((end_time - start_time)) seconds"
