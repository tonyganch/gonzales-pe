#!/bin/bash

./scripts/build.sh

mkdir -p dist

set -e -u
echo "Generating webpack modules"

webpack --module-bind "json=json" --module-bind "node.js=null" --define IS_WEBPACK=true --output-library-target umd lib/gonzales.js dist/gonzales.core.js
webpack --module-bind "json=json" --define IS_WEBPACK=true --output-library-target umd lib/css/index.js dist/gonzales.css.js
webpack --module-bind "json=json" --define IS_WEBPACK=true --output-library-target umd lib/less/index.js dist/gonzales.less.js
webpack --module-bind "json=json" --define IS_WEBPACK=true --output-library-target umd lib/sass/index.js dist/gonzales.sass.js
webpack --module-bind "json=json" --define IS_WEBPACK=true --output-library-target umd lib/scss/index.js dist/gonzales.scss.js