#!/bin/bash

set -e

function print_npmignore() {
  cat << EOIGNORE
docs/
log/
node_modules/
scripts/
src/
test/
EOIGNORE
}

print_npmignore > .npmignore

./scripts/build.sh
