#!/bin/bash

DIR_TO_MONITOR="/pixel/report"

OPTIMIZATION_TAG="OptimizedWithOptiPNG"

ENABLE_DEBUG_LOGGING=0

debug_log() {
    if [ "$ENABLE_DEBUG_LOGGING" -ne 1 ]; then
        return
    fi
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

remove_lock_file() {
    local LOCK_FILE
    LOCK_FILE=$1
    if [ -f "$LOCK_FILE" ]; then
        rm -f "$LOCK_FILE" || true
    fi
}

optimize_png() {
    sleep 1

    local FILE
    FILE=$1

    if exiftool -quiet -Software "$FILE" | grep -q "$OPTIMIZATION_TAG"; then
        debug_log "$FILE already optimized, skipping"
        return
    fi

    # Replace '/' with '_' in the file path to create a unique lock file name
    local LOCK_FILE
    LOCK_FILE="/tmp/$(echo "$FILE" | sed 's/\//_/g').lock"

    if [ -f "$LOCK_FILE" ]; then
        debug_log "$FILE already being processed, skipping"
        return
    fi

    touch "$LOCK_FILE"

    local SIZE_BEFORE
    SIZE_BEFORE=$(stat -c%s "$FILE")

    optipng -silent -fix -o2 "$FILE"

    exiftool -quiet -overwrite_original_in_place -Software="$OPTIMIZATION_TAG" "$FILE"

    if ! exiftool -quiet -Software "$FILE" | grep -q "$OPTIMIZATION_TAG"; then
        debug_log "$FILE failed to write processed flag"
        remove_lock_file "$LOCK_FILE"
        return
    fi

    local SIZE_AFTER
    SIZE_AFTER=$(stat -c%s "$FILE")

    local SIZE_REDUCTION
    SIZE_REDUCTION=$((SIZE_BEFORE - SIZE_AFTER))
    local SIZE_PERCENT_REDUCTION
    if [ "$SIZE_BEFORE" -ne 0 ]; then
        SIZE_PERCENT_REDUCTION=$(echo "scale=2; ($SIZE_REDUCTION / $SIZE_BEFORE) * 100" | bc)
    else
        SIZE_PERCENT_REDUCTION=0
    fi

    echo "$FILE optimized: Size reduction = $SIZE_PERCENT_REDUCTION%"

    remove_lock_file "$LOCK_FILE"
}

monitor_dir_and_optimize_pngs_upon_creation() {
  local DIR
  DIR=$1
  local FILE_LOWER
  while true; do
      inotifywait -r -m -e create --format '%w%f' "$DIR" | while read FILE
      do
          FILE_LOWER=$(echo "$FILE" | tr '[:upper:]' '[:lower:]')
          if [[ "$FILE_LOWER" =~ \.png$ ]]; then
              optimize_png "$FILE" &
          fi
      done
  done
}

ensure_dependencies_present() {
  if ! command -v inotifywait &> /dev/null || 
     ! command -v optipng &> /dev/null || 
     ! command -v exiftool &> /dev/null; then
      debug_log "Required tools are missing. The Dockerfile should install inotify-tools, optipng, and exiftool."
      exit 1
  fi
}

ensure_dependencies_present

monitor_dir_and_optimize_pngs_upon_creation "$DIR_TO_MONITOR"