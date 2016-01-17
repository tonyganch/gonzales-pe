#!/bin/bash

if [[ ! -d 'lib' ]]; then
  npm i babel@5.8.34 --save
  ./scripts/build.sh
fi
