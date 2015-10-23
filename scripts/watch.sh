#!/bin/bash

rm -rf lib
mkdir -p lib

printf "\n\
-----------------------\n\
 Watching source files\n\
-----------------------\n\n"
./node_modules/.bin/webpack --module-bind "json=json" --watch
