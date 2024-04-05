#!/bin/bash

# Build the pixel-base-regression image
docker build --progress=plain -f Dockerfile.base-regression -t pixel-base-regression:latest .