#!/bin/bash

java -jar node_modules/google-closure-compiler/compiler.jar --compilation_level=SIMPLE --js_output_file=lib/gonzales.min.js lib/gonzales.js
