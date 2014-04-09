var gonzales = require('./../lib/gonzales');
var Mocha = require('mocha');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
require('coffee-script/register');

var mocha = new Mocha();
if (process.env.TEST_COV) mocha.reporter('html-cov');

// Tell mocha which tests to run:
['test/css', 'test/less', 'test/sass', 'test/scss'].forEach(function(dirname) {
    fs.readdirSync(dirname).forEach(function(file) {
        mocha.addFile(path.join(dirname, file));
    });
});

// Add helpers (see tests for usage examples):
mocha.suite.beforeEach(function() {
    var _this = this;
    this.filename = null;

    this.shouldBeOk = function(filename) {
        var rule = path.basename(this.filename, '.coffee');
        var syntax = path.basename(path.dirname(this.filename));

        var input = readFile(filename + '.' + syntax);
        var expected = readFile(filename + '.p');

        var options = {
            css: input,
            rule: rule,
            syntax: syntax
        };

        var ast = gonzales.cssToAST(options);
        var parsedTree = treeToString(ast).replace(/,\s\n/g, ',\n');
        var compiledString = gonzales.astToCSS({ syntax: syntax, ast: ast });

        try {
            assert.equal(parsedTree, expected);
            assert.equal(compiledString, input);
        } catch (e) {
            var message = '\nExpected:\n' +
                e.expected + '\n\nResult:\n' + e.actual;
            throw { message: message };
        }
    };

    function readFile(filename) {
        var dirname = path.join(_this.filename.slice(0, -7), filename);
        return fs.readFileSync(dirname, 'utf8').trim();
    }

    function treeToString(tree, level) {
        level = level || 0;
        var spaces = dummySpaces(level),
            s = (level ? '\n' + spaces : '') + '[';

        tree.forEach(function(e) {
            s += Array.isArray(e) ?
                     treeToString(e, level + 1) :
                     ('\'' + e.toString() + '\'');
            s += ', ';
        });

        return (s.substr(0, s.length - 2) + ']').replace(/,\s\n/g, ',\n');
    }

    function dummySpaces(num) {
        return '                                                  '
            .substr(0, num * 2);
    }
});

mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});


