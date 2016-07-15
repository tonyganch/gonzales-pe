#!/bin/bash

EXIT_CODE=0

function test {
    "$@"
    if [ $? -ne 0 ]; then
        EXIT_CODE=1
    fi
}

function run_all_tests {
./scripts/build.sh

printf "\n\
---------------------\n\
 Running Mocha (all)\n\
---------------------\n\n"
    REPORTER="dot"

    find ./ -name .DS_Store | xargs rm

    printf "Parser tests"
    test node ./test/parser.js
    #printf "Parsing error tests"
    #test ./node_modules/.bin/mocha -R $REPORTER ./test/parsing-error.js
    printf "Tab size tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/tab-size.js
    printf "Basic node tests"
    test ./node_modules/.bin/mocha -R $REPORTER ./test/node/basic-node.js
    #printf "Empty node tests"
    #test ./node_modules/.bin/mocha -R $REPORTER ./test/node/empty-node.js
}

function run_syntax_tests {
./scripts/build.sh "$1"

printf "\n\
----------------------\n\
 Running Mocha ("$1")\n\
----------------------\n\n"
    printf "Parser tests for syntax: $1"
    test node ./test/parser.js $1
}

if [ $# -eq 0 ]; then
  ./scripts/lint.sh
  run_all_tests
  syntaxes="css less sass scss"
else
  syntaxes=$@
fi

for syntax in $syntaxes; do
  run_syntax_tests "$syntax"
done

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
