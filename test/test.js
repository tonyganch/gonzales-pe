var fs = require('fs'),
    gonzales = require('./../lib/gonzales'),
    syntaxes = fs.readdirSync(__dirname),
    okn = total = 0,
    logPath = __dirname + '/../log',
    expected = logPath + '/expected.txt',
    result = logPath + '/result.txt';

var funcs = {
    'p': function parse(options) {
            return treeToString(cleanInfo(gonzales.cssToAST(options)));
         },
    'l': function translate(options) {
            return gonzales.astToCSS({syntax: options.syntax, ast: gonzales.cssToAST(options)});
         }
};

console.log('Running tests...');

fs.writeFile(expected, '', function () {});
fs.writeFile(result, '', function () {});

for (var s = 0, sl = syntaxes.length; s < sl; s++) {
    var syntax = syntaxes[s];
    var syntaxDir = __dirname + '/' + syntax;

    if (!fs.lstatSync(syntaxDir).isDirectory()) continue;

    var rules = fs.readdirSync(syntaxDir);
    rules.forEach(function(rule) {
        var ruleDir = syntaxDir + '/' + rule;
        var testFiles = fs.readdirSync(ruleDir);
        var files = {};

        testFiles.forEach(function(file) {
            var i = file.lastIndexOf('.');
            if (i !== -1) {
                var ext = file.substring(i + 1);
                var k = file.substring(0, i);
                if (!(k in files)) files[k] = {};
                files[k][ext] = 1;
            }
        });

        for (var k in files) {
            if (files[k][syntax]) {
                var css = fs.readFileSync(ruleDir + '/' + k + '.' + syntax).toString().trim();
                for (var a in funcs) {
                    if (!(a in files[k])) continue;

                    total++;
                    var params = {css: css, rule: rule, needInfo: true, syntax: syntax};
                    var b = funcs[a](params).replace(/,\s\n/g, ',\n');
                    var c = fs.readFileSync(ruleDir + '/' + k + '.' + a).toString().trim();
                    r = b === c;
                    r && okn++;
                    if (!r) {
                        console.log('\n---------------------');
                        console.log('FAIL: ' + syntax + '/' + rule + '/' + k + '.' + a);

                        console.log('\nExpected:\n', c);
                        fs.appendFile(expected, c + '\n\n\n', function(){});

                        console.log('\nResult:\n', b);
                        fs.appendFile(result, b + '\n\n\n', function(){});
                    }
                }
            }
        }
    });
}

console.log('Total: ' + total + '. Ok: ' + okn + '. Fail: ' + (total - okn));

function treeToString(tree, level) {
    level = level || 0;
    var spaces = dummySpaces(level),
        s = (level ? '\n' + spaces : '') + '[';

    tree.forEach(function(e) {
        s += (Array.isArray(e) ? treeToString(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
    });

    return s.substr(0, s.length - 2) + ']';
}

function dummySpaces(num) {
    return '                                                  '.substr(0, num * 2);
}

function cleanInfo(tree) {
    var r = [];
    tree = tree.slice(1);

    tree.forEach(function(e) {
        r.push(Array.isArray(e) ? cleanInfo(e) : e);
    });

    return r;
}
