#!/usr/bin/env node

var parseArgs = require('minimist');
var gonzales = require('..');
var fs = require('fs');
var path = require('path');

var options = getOptions();
process.stdin.isTTY ? processFile(options._[0]) : processSTDIN();

function getOptions() {
    var parserOptions = {
        boolean: ['silent'],
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
        process.stdout.write(ast.toJson());
        process.exit(0);
    } catch (e) {
        if (!options.silent) process.stderr.write(e.message);
        process.exit(1);
    }
}
