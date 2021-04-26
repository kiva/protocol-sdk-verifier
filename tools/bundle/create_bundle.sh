#!/bin/bash

if [ $3 ]; then
    echo "This command only accepts two arguments: a config file and, optionally, the --prod, --dev or --sandbox option"
    exit 99
fi

if [ -d build ]; then
    echo "Removing directory: build"
    rm -rf build
fi

CONFIG_FILE=""
DEPLOY_TARGET=qa

while [ "$1" != "" ]; do
    case $1 in
        --prod )
            echo "** CHANGING \$DEPLOY_TARGET to \"prod\" !!!!"
            DEPLOY_TARGET=prod
            ;;
        --sandbox )
            echo "** CHANGING \$DEPLOY_TARGET to \"sandbox\" !!!!"
            DEPLOY_TARGET=sandbox
            ;;
        --dev )
            echo "** CHANGING \$DEPLOY_TARGET to \"dev\" !!!!"
            DEPLOY_TARGET=dev
            ;;
        * )
            CONFIG_FILE=$1
    esac
    shift
done

echo "============= BUILDING BUNDLE FOR $DEPLOY_TARGET ============="

npm rebuild node-sass

# Similar to problem in below Shell file, this will be run from root
sh ./tools/bundle/static_file_generator.sh $CONFIG_FILE $DEPLOY_TARGET

node node_modules/node-sass-chokidar/bin/node-sass-chokidar src/ -o src/

node node_modules/react-scripts/bin/react-scripts build
