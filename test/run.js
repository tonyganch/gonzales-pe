var g = require('../lib/gonzales'),
    fs = require('fs'),
    css = fs.readFileSync('./test/bench/5-githubs.css', 'utf8');
var o = g.srcToAST({src: css});
