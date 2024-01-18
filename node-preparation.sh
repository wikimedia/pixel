#!/bin/bash

set -eu

_validate_major_version() {
  local major_version="${1:-}"
  if [[ -z "$major_version" ]]; then
    echo "Major version parameter is missing"
    return 1
  fi
  if [[ ! "$major_version" =~ ^[0-9]+$ ]]; then
    echo "Invalid major version parameter"
    return 1
  fi
  return 0
}

is_node_major_version_installed() {
  local major_version
  local installed_version
  major_version="$1"
  _validate_major_version "$major_version" || return 1
  installed_version=$(node -v 2>/dev/null | cut -d'.' -f1 | tr -d 'v')
  if [[ -z "$installed_version" ]]; then
    installed_version="0"
  fi
  if [ "$installed_version" -eq "$major_version" ]; then
    return 0
  fi
  return 1
}

install_node_major_version() {
  local major_version
  major_version="$1"
  _validate_major_version "$major_version" || return 1
  apt-get update
  apt-get install -y ca-certificates gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL --retry 10 --retry-delay 10 https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$major_version.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install nodejs -y
  if is_node_major_version_installed "$major_version"; then
    return 0
  fi
  return 1
}

ensure_node_major_version_installed() {
  local major_version
  major_version="$1"
  _validate_major_version "$major_version" || return 1
  if is_node_major_version_installed "$major_version"; then
    echo "Node.js major version $major_version is already installed"
    return 0
  elif install_node_major_version "$major_version"; then
    echo "Successfully installed Node.js major version $major_version"
    return 0
  fi
  echo "Failed to install Node.js major version $major_version"
  return 1
}

"$@"
