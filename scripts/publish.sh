#!/bin/bash

set -e

start=$(git log -1 --skip=1 --grep="v3." --pretty=format:"%h")
head_version=$(git log -1 --pretty=format:"%B")
start_version=$(git log -1 --skip=1 --grep="v3." --pretty=format:"%B")

log=$(git log "$start"..HEAD --pretty=format:"%h" --reverse)

git checkout 3.0

for commit in $log; do
  git cherry-pick $commit
done

sed -i -- "s/$start_version/$head_version/g" README.md

git commit -a

npm publish
