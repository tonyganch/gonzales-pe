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
['test/css', 'test/less', 'test/sass', 'test/scss', 'test/js'].forEach(function(dirname) {
    fs.readdirSync(dirname).forEach(function(file) {
        mocha.addFile(path.join(dirname, file));
    });
});

mocha.suite.beforeEach(function() {
    this.filename = null;

    this.shouldBeOk = function(filename) {
        var rule = path.basename(this.filename, '.coffee');
        var syntax = path.basename(path.dirname(this.filename));

        var dirname = this.filename.slice(0, -7);
        var input = readFile(dirname, filename + '.' + syntax);
        var expected = readFile(dirname, filename + '.p');

        var options = {
            src: input,
            rule: rule,
            syntax: syntax
        };

        var ast = gonzales.srcToAST(options);
        var parsedTree = gonzales.astToString(ast).replace(/,\s\n/g, ',\n');
        var compiledString = gonzales.astToSrc({ syntax: syntax, ast: ast });

        try {
            assert.equal(parsedTree, expected);
            assert.equal(compiledString, input);
        } catch (e) {
            var message = '\nExpected:\n' +
                e.expected + '\n\nResult:\n' + e.actual;
            fs.appendFile(expectedLogPath, e.expected + '\n\n\n', function(){});
            fs.appendFile(resultLogPath, e.actual + '\n\n\n', function(){});
            throw { message: message };
        }
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
