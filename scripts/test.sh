#!/bin/bash

printf "\n\
---------------\n\
 Running Mocha\n\
---------------\n\n"
REPORTER="dot"

if [ $# -eq 0 ]; then
    printf "Parser tests"
    node ./test/parser.js
    printf "Parsing error tests"
    ./node_modules/.bin/mocha -R $REPORTER ./test/parsing-error.js
    printf "Basic node tests"
    ./node_modules/.bin/mocha -R $REPORTER ./test/node/basic-node.js
    printf "Empty node tests"
    ./node_modules/.bin/mocha -R $REPORTER ./test/node/empty-node.js
else
    printf "Parser tests for syntax: $1"
    node ./test/parser.js $1
fi
