#!/bin/bash

set -e

print_npmignore() {
  cat << EOIGNORE
docs/
test/
EOIGNORE
}

print_npmignore > .npmignore
