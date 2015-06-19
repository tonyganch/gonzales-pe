var gonzales = require('./..');
var assert = require('assert');
var fs = require('fs');
var Mocha = require('mocha');
var path = require('path');
require('coffee-script/register');

var expectedLogPath, resultLogPath;

function clearLogFiles() {
    var logPath = __dirname + '/../log';
    expectedLogPath = logPath + '/expected.txt';
    resultLogPath = logPath + '/result.txt';
    fs.writeFile(expectedLogPath, '', function () {});
    fs.writeFile(resultLogPath, '', function () {});
}

// Tell mocha which tests to run:
function addTestFiles(mocha) {
    var syntax = process.argv[2];
    var syntaxDirs = syntax ?
        ['test/' + syntax] :
        ['test/css', 'test/less', 'test/sass', 'test/scss'];
    syntaxDirs.forEach(function(syntaxDir) {
        fs.readdirSync(syntaxDir).forEach(function(testDir) {
            mocha.addFile(path.join(syntaxDir, testDir, 'test.coffee'));
        });
    });
};

function shouldBeOk() {
    var filename = this.test.title;
    var testDir = path.dirname(this.test.file);
    var rule = path.basename(testDir);
    var syntax = path.basename(path.dirname(testDir));
    var testTitle = this.test.parent.title + ' ' + this.test.title;

    var input = readFile(testDir, filename + '.' + syntax);
    var expected = readFile(testDir, filename + '.json');

    var options = {
        rule: rule,
        syntax: syntax,
        needInfo: true
    };

    try {
        var ast = gonzales.parse(input, options);
        expected = JSON.parse(expected);
        assert.deepEqual(ast, expected);
    } catch (e) {
        logAndThrow(testTitle,  e, 'Failed src -> ast');
    }

    try {
        var compiledString = ast.toString();
        assert.equal(compiledString, input);
    } catch (e) {
        logAndThrow(testTitle, e, 'Failed ast -> src');
    }
}

function readFile(dirname, filename) {
    var filePath = path.join(dirname, filename);
    return fs.readFileSync(filePath, 'utf8').trim();
}

function logAndThrow(filename, e, message) {
    var expected = JSON.stringify(e.expected, false, 2);
    var actual = JSON.stringify(e.actual, false, 2);

    e.message = message;

    fs.appendFile(expectedLogPath, filename + '\n\n' + expected + '\n\n\n', function(){});
    fs.appendFile(resultLogPath, filename + '\n\n' + actual + '\n\n\n', function(){});

    throw e;
}

var mocha = new Mocha();
mocha.reporter('dot');

mocha.suite.beforeEach(function() {
    this.shouldBeOk = shouldBeOk;
});

clearLogFiles();
addTestFiles(mocha);

mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});
