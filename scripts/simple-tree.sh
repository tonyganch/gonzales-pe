#!/usr/bin/env node

'use strict';

var gonzales = require('..');
var fs = require('fs');
var path = require('path');

console.log(__dirname)
fs.readdir('../src/docs/node-types', processFiles);

function processFiles(err, files) {
throw err;
  console.log(err);
  console.log(files);
}


function getOptions() {
    var parserOptions = {
        boolean: ['silent', 'simple'],
        alias: {
            syntax: 's',
            context: 'c'
        }
    };
    return parseArgs(process.argv.slice(2), parserOptions);
}

function processSTDIN() {
    var input = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (data) {
        input += data;
    });
    process.stdin.on('end', function () {
        processInputData(input);
    });
}

function processFile(file) {
    if (!file) process.exit(0);
    if (!options.syntax) options.syntax = path.extname(file).substring(1);
    var css = fs.readFileSync(file, 'utf-8').trim();
    processInputData(css);
}

function processInputData(input) {
    try {
        var ast = gonzales.parse(input, {
            syntax: options.syntax,
            rule: options.context
        });
        printTree(ast);
        process.exit(0);
    } catch (e) {
        if (!options.silent) process.stderr.write(e.toString());
        process.exit(1);
    }
}

function printTree(ast) {
    if (!options.simple) {
        var tree = JSON.stringify(ast, ['type', 'content'], 2);
        process.stdout.write(tree);
    } else {
        var lastLevel;

        ast.traverse(function(node, params) {
            lastLevel = params.nestingLevel;
            var type = node.type;
            var spaces = new Array(lastLevel).join(' |');
            if (typeof node.content === 'string') {
                var content = JSON.stringify(node.content);
                console.log(spaces, '->', type);
                console.log(spaces, '  ', content);
            } else {
                console.log(spaces, '->', type);
            }
        });

        var spaces = new Array(lastLevel).join(' -');
        console.log(spaces);
    }
}

