#!/bin/bash

DIR_TO_MONITOR="/pixel/report"

OPTIMIZATION_TAG="OptimizedWithOptiPNG"

ENABLE_DEBUG_LOGGING=1

debug_log() {
  if [ "$ENABLE_DEBUG_LOGGING" -ne 1 ]; then
    return
  fi
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

remove_lock_file() {
  local lock_file
  lock_file=$1
  if [ -f "$lock_file" ]; then
    rm -f "$lock_file" || true
  fi
}

wait_for_stable_file_size() {
  local file=$1
  local max_attempts=20
  local attempt=0
  local size1=0
  local size2=1
  while [ "$size1" != "$size2" ] || [ "$size1" -eq 0 ]; do
    size1=$(stat -c%s "$file")
    sleep 0.1
    size2=$(stat -c%s "$file")
    attempt=$((attempt + 1))
    if [ "$attempt" -eq "$max_attempts" ]; then
      debug_log "File is empty or size is unstable - $file"
      return 1
    fi
  done
  debug_log "wait_for_stable_file_size attempts: $attempt"
  return 0
}

optimize_png() {
  local file
  file=$1

  if ! wait_for_stable_file_size "$file"; then
    debug_log "Skipping optimization for unstable file: $file"
    return
  fi

  if exiftool -quiet -Software "$file" | grep -q "$OPTIMIZATION_TAG"; then
    debug_log "$file already optimized, skipping"
    return
  fi

  local lock_file
  lock_file="/tmp/$(echo "$file" | sed 's/\//_/g').lock"

  if [ -f "$lock_file" ]; then
    debug_log "$file already being processed, skipping"
    return
  fi

  touch "$lock_file"

  local size_before
  size_before=$(stat -c%s "$file")

  optipng -silent -fix -o2 "$file"

  exiftool -quiet -overwrite_original_in_place -Software="$OPTIMIZATION_TAG" "$file"

  if ! exiftool -quiet -Software "$file" | grep -q "$OPTIMIZATION_TAG"; then
    debug_log "$file failed to write processed flag"
    remove_lock_file "$lock_file"
    return
  fi

  local size_after
  size_after=$(stat -c%s "$file")

  local size_reduction
  size_reduction=$((size_before - size_after))
  local size_percent_reduction
  if [ "$size_before" -ne 0 ]; then
    size_percent_reduction=$(echo "scale=2; ($size_reduction / $size_before) * 100" | bc)
  else
    size_percent_reduction=0
  fi

  echo "$file optimized: Size reduction = $size_percent_reduction%"

  remove_lock_file "$lock_file"
}

monitor_dir_optimizing_pngs_upon_creation() {
  local dir
  dir=$1
  local file_lower
  while true; do
    inotifywait -r -m -e create --format '%w%f' "$dir" | while read file; do
      file_lower=$(echo "$file" | tr '[:upper:]' '[:lower:]')
      if [[ "$file_lower" =~ \.png$ ]]; then
        optimize_png "$file" &
      fi
    done
  done
}

ensure_dependencies_present() {
  if ! command -v inotifywait &>/dev/null ||
    ! command -v optipng &>/dev/null ||
    ! command -v exiftool &>/dev/null; then
    debug_log "Required tools are missing. The Dockerfile should install inotify-tools, optipng, and exiftool."
    exit 1
  fi
}

ensure_dependencies_present

monitor_dir_optimizing_pngs_upon_creation "$DIR_TO_MONITOR"
