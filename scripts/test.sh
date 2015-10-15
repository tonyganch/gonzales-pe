#!/bin/bash

EXIT_CODE=0

function test {
    "$@"
    if [ $? -ne 0 ]; then
        EXIT_CODE=1
    fi
}

if [ $# -eq 0 ]; then
# Run linters
printf "\n\
----------------\n\
 Running JSHint\n\
----------------\n\n"
    test ./node_modules/.bin/jshint ./src

printf "\n\
--------------\n\
 Running JSCS\n\
--------------\n\n"
    test ./node_modules/.bin/jscs ./src


printf "\n\
---------------\n\
 Running Mocha\n\
---------------\n\n"
    REPORTER="dot"

    printf "Parser tests"
    test node ./test/parser.js
    printf "Parsing error tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/parsing-error.js
    printf "Tab size tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/tab-size.js
    printf "Basic node tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/node/basic-node.js
    printf "Empty node tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/node/empty-node.js
else
printf "\n\
---------------\n\
 Running Mocha\n\
---------------\n\n"
    printf "Parser tests for syntax: $1"
    test node ./test/parser.js $1
fi

if [ $EXIT_CODE -ne 0 ]; then
printf "\n\
----------------------------------------------------\n\
 Please, fix errors shown above and run tests again\n\
----------------------------------------------------\n"
else
printf "\n\
------------------------\n\
 Everything looks fine!\n\
------------------------\n"
fi

exit $EXIT_CODE
