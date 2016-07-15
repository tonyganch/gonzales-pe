#!/bin/bash

set -e

# Run linters
printf "\n\
----------------\n\
 Running JSHint\n\
----------------\n\n"
./node_modules/.bin/jshint ./src

printf "\n\
----------------\n\
 Running ESLint\n\
----------------\n\n"
./node_modules/.bin/eslint ./src

printf "\n\
--------------\n\
 Running JSCS\n\
--------------\n\n"
./node_modules/.bin/jscs ./src
