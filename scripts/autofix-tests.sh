#!/bin/bash

# Generate `.json` test files.
# Usage: `./scripts/autofix-tests.sh [<syntax name>]`.
# Example: `./scripts/autofix-tests.sh scss`.

printf "\n\
------------------\n\
 Generating tests\n\
------------------\n\n"

syntaxes=${@:-css less sass scss}

for syntax in $syntaxes; do
    files=$(find ./test/$syntax -name "*.$syntax")
    for file in $files; do
        context=${file#*/*/*/}
        context=${context%/*}
        ./bin/gonzales.js -c $context --silent $file > ${file%.*}.json
        if [ $? -ne 0 ]; then
            printf "\nFailed to parse: $file\n"
        else
            printf "."
        fi
    done
done
printf "\n"
