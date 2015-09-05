#!/bin/bash

# Generate `.json` test files.
# Usage: `./scripts/autofix-tests.sh [<syntax name>]`.
# Example: `./scripts/autofix-tests.sh scss`.

printf "\n\
------------------\n\
 Generating tests\n\
------------------"

syntaxes=${@:-css less sass scss}
failed_tests=()

for syntax in $syntaxes; do
    printf "\n\nSyntax: $syntax\n"
    files=$(find ./test/$syntax -name "*.$syntax")
    for file in $files; do
        context=${file#*/*/*/}
        context=${context%/*}
        ./bin/gonzales.js -c $context --silent $file > ${file%.*}.json
        if [ $? -ne 0 ]; then
            failed_tests+=($file)
            # :(
            git checkout -- ${file%.*}.json
            printf "x"
        else
            printf "."
        fi
    done
done
printf "\n"

ft=${#failed_tests[@]}
if [ $ft -ne 0 ]; then
    printf "\nFailed to parse following files:\n"
    for (( i=0; i<$ft; i++ )); do
        printf "${failed_tests[$i]}\n"
    done
fi
