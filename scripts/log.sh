#!/bin/bash

printf "\n\
-------------------------\n\
 Running Mocha with logs\n\
-------------------------\n\n"
(mkdir -p log && node ./test/mocha.js) | tee ./log/test.log
