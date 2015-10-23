#!/bin/bash

rm -rf lib
mkdir -p lib

printf "\n\
----------------------------\n\
 Generating webpack modules\n\
----------------------------\n\n"

if [ $# -eq 0 ]; then
  ./node_modules/.bin/webpack --module-bind "json=json"
else
  ./node_modules/.bin/webpack --module-bind "json=json"

  syntaxes=$@
  for syntax in $syntaxes; do
    SYNTAX="$syntax" ./node_modules/.bin/webpack --module-bind "json=json"
  done
fi
