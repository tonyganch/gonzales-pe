#!/bin/bash

rm -rf lib
mkdir -p lib

if [ $# -eq 0 ]; then
  syntaxes="css less sass scss"
else
  syntaxes=$@
fi

printf "\n\
-------------------------------------------------\n\
 Generating webpack modules ($syntaxes)\n\
-------------------------------------------------\n\n"

echo 'module.exports = {' > src/syntaxes.js

for syntax in $syntaxes; do
  echo "$syntax: require('./$syntax')," >> src/syntaxes.js
done

echo '};' >> src/syntaxes.js

./node_modules/.bin/webpack --module-bind "json=json"
java -jar node_modules/google-closure-compiler/compiler.jar --compilation_level=SIMPLE --js_output_file=lib/gonzales.min.js lib/gonzales.js

git checkout -- src/syntaxes.js
