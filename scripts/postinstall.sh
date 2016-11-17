#!/bin/bash

if [[ ! -d 'lib' ]]; then
  echo 'PANDA MODE'
  npm i webpack@^1.12.2
  npm i json-loader@^0.5.3
  npm i babel-core@^6.18.2
  npm i babel-preset-es2015@^6.18.0
  npm i babel-plugin-add-module-exports@^0.2.1
  npm i babel-loader@^6.2.7
  ./node_modules/.bin/webpack --module-bind "json=json" --module-bind "js=babel-loader?{'plugins': ['add-module-exports'], 'presets': [['es2015', {'loose': true}]]}"
fi
