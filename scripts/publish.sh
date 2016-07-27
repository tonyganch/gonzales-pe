#!/bin/bash

set -e

start=$(git log -1 --skip=1 --grep="v3." --pretty=format:"%h" --reverse)
log=$(git log "$start"..HEAD --pretty=format:"%h" --reverse)
git checkout 3.0
for commit in $log; do
  git cherry-pick $commit
done
