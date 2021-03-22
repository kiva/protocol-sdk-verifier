#!/bin/bash

if [ ! -d .git ]; then
    echo "Making a .git directory"
    mkdir .git
fi

if [ ! -d .git/hooks ]; then
    echo "Making a .git/hooks directory"
    mkdir .git/hooks
fi

for file in `ls ./hooks`
do
    chmod +x hooks/$file
    ln -s -f ../../hooks/$file .git/hooks/$file
done
