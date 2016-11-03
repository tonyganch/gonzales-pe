#!/bin/bash

git config commit.template .gitmessage.txt

./scripts/build.sh
./scripts/compile.sh
