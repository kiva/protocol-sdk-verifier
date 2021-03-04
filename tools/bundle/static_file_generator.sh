#!/bin/bash

CONFIG_FILE=$1
BUILD_TYPE=$2

# Because this is run from package.json, filepaths stem from the root directory
if [ ! -d "./src/assets" ]; then
    echo "Creating src/assets directory..."
    mkdir ./src/assets
    echo "Done!\n"
fi

if [ ! -d "./src/assets/images" ]; then
    echo "Creating src/assets/images directory..."
    mkdir ./src/assets/images
    echo "Done!\n"
fi

# Designed to be run from package.json, so path is relative to that
node ./tools/bundle/ImageConverter.js
node ./tools/bundle/Build.js $CONFIG_FILE $BUILD_TYPE
