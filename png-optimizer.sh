#!/bin/bash

set -e

OPTIMIZATION_TAG="OptimizedWithOptiPNG"

ENABLE_DEBUG_LOGGING=1

debug_log() {
  if [ "$ENABLE_DEBUG_LOGGING" -ne 1 ]; then
    return
  fi
  echo "$(date +"%Y-%m-%d %H:%M:%S") - Job $PARALLEL_SEQ - $1"
}

optimize_png() {
  local file
  file=$1

  if exiftool -quiet -Software "$file" | grep -q "$OPTIMIZATION_TAG"; then
    debug_log "$file already optimized, skipping"
    return
  fi

  local size_before
  size_before=$(stat -c%s "$file")

  optipng -silent -fix -o2 "$file"

  exiftool -quiet -overwrite_original_in_place -Software="$OPTIMIZATION_TAG" "$file"

  if ! exiftool -quiet -Software "$file" | grep -q "$OPTIMIZATION_TAG"; then
    debug_log "$file failed to write processed flag"
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
}

optimize_pngs_in_dir_recursively() {
  local start_time end_time duration
  start_time=$(date +%s)
  local dir
  dir=$1

  # Remove any dangling exiftool temp files
  find "$dir" -type f -iname "*.png_exiftool_tmp" -delete

  # Parallel run, "-j+0" keeps each core fed with one job at a time
  find "$dir" -type f -iname "*.png" -print0 | parallel -0 -j+0 optimize_png {}

  # Series run
  # find "$dir" -type f -iname "*.png" -print0 | while read -r -d '' file; do optimize_png "$file"; done

  end_time=$(date +%s)
  duration=$((end_time - start_time))
  echo "Duration: $duration seconds"
}

export_all_functions_and_variables() {
  local func var
  for func in $(declare -F | awk '{print $3}'); do
    export -f $func
  done
  for var in $(compgen -v); do
    export "$var"
  done
}

# Needed to use "parallel"
export_all_functions_and_variables

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  optimize_pngs_in_dir_recursively "$1"
fi