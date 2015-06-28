#!/bin/bash

printf "\n\
-----------------------\n\
 Watching source files\n\
-----------------------\n\n"
./node_modules/.bin/babel --loose all --compact true --comments false --blacklist spec.functionName src --out-dir lib --watch
