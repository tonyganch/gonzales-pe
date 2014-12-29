#!/usr/bin/env node

/**
 * ./bin/gonzales.js filename
 * ./bin/gonzales.js filename -s
 */
var gonzales = require('../lib/gonzales'),
    fs = require('fs'),
    filename = process.argv[2],
    silent = process.argv[3] === '-s';

if (!filename) {
  console.log('Please supply a filename. Usage "gonzales file"');
  process.exit();
}

try {
    var ast = gonzales.parse(fs.readFileSync(filename).toString());
    if (!silent) console.log(gonzales.toString({ast: ast}));
} catch (e) {
    if (!silent) throw e;
}
