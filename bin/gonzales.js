#!/usr/bin/env node

var gonzales = require('../lib/gonzales'),
    fs = require('fs'),
    filename = process.argv[2];

if (!filename) {
  console.log('Please supply a filename. Usage "gonzales file"');
  process.exit();
}

console.log(gonzales.toString({ast: gonzales.parse(fs.readFileSync(filename).toString())}));

