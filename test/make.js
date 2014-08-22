var gonzales = require('./../lib/gonzales');
var assert = require('assert');
var fs = require('fs');
var Mocha = require('mocha');
var path = require('path');
require('coffee-script/register');

var mocha = new Mocha();
// mocha.reporter('spec');

// Clear log files:
var logPath = __dirname + '/../log';
var expectedLogPath = logPath + '/expected.txt';
var resultLogPath = logPath + '/result.txt';
fs.writeFile(expectedLogPath, '', function () {});
fs.writeFile(resultLogPath, '', function () {});

// Tell mocha which tests to run:
var syntaxDirs = ['test/css'];
syntaxDirs.forEach(function(syntaxDir) {
    fs.readdirSync(syntaxDir).forEach(function(testDir) {
        mocha.addFile(path.join(syntaxDir, testDir, 'test.coffee'));
    });
});

mocha.suite.beforeEach(function() {
    this.filename = null;

    this.shouldBeOk = function(filename) {
        var testDir = path.dirname(this.filename);
        var rule = path.basename(testDir);
        var syntax = path.basename(path.dirname(testDir));

        var input = readFile(testDir, filename + '.' + syntax);

        var options = {
            src: input,
            rule: rule,
            syntax: syntax,
            needInfo: true
        };

        var ast = gonzales.srcToAST(options);
        var parsedTree = gonzales.astToString(ast);
        var expectedFile = path.join(testDir, filename + '.json');
        fs.writeFileSync(expectedFile, parsedTree);
    };

});

mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});

function readFile(dirname, filename) {
    var filePath = path.join(dirname, filename);
    return fs.readFileSync(filePath, 'utf8').trim();
}

function logAndThrow(e) {
    var expected = JSON.stringify(e.expected, false, 2);
    var actual = JSON.stringify(e.actual, false, 2);

    var message = '\nExpected:\n' + expected +
        '\n\nResult:\n' + actual;

    fs.appendFile(expectedLogPath, expected + '\n\n\n', function(){});
    fs.appendFile(resultLogPath, actual + '\n\n\n', function(){});

    throw { message: message };
}
