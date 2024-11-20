#!/bin/bash

get_docker_storage_driver() {
  local storage_driver
  storage_driver=$(docker info 2>/dev/null | grep "Storage Driver:" | awk '{print $3}')
  echo "$storage_driver"
}

print_docker_storage_driver_warning_if_necessary() {
  if [ "$(get_docker_storage_driver)" = "overlayfs" ]; then
    echo -e "\n\033[31mWARNING:\n\tDocker is using 'overlayfs' storage driver which may cause issues with Pixel\033[0m"
    echo -e "To fix:"
    echo -e "\t- Open Docker Desktop > 'Settings' > 'General'"
    echo -e "\t- Uncheck 'Use containerd for pulling and storing images'"
    echo
    return 1
  fi
  return 0
}

print_docker_storage_driver_warning_if_necessary