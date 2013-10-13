var fs = require('fs'),
    cssToAST = require('./../lib/gonzales.cssp.node.js').cssToAST,
    astToCSS = require('./../lib/cssp.translator.node.js').astToCSS,
    syntaxes = fs.readdirSync(__dirname),
    okn = total = 0;

var funcs = {
    'p': function parse(options) {
            return treeToString(cleanInfo(cssToAST(options)));
         },
    'l': function translate(options) {
            return astToCSS({syntax: options.syntax, src: cssToAST(options), info: true});
         }
};

console.log('Running tests...');

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
            if (files[k].css) {
                var src = fs.readFileSync(ruleDir + '/' + k + '.css').toString().trim();
                for (var a in funcs) {
                    if (!(a in files[k])) continue;

                    total++;
                    var params = {src: src, rule: rule, info: true, syntax: syntax};
                    var b = funcs[a](params).replace(/,\s\n/g, ',\n');
                    var c = fs.readFileSync(ruleDir + '/' + k + '.' + a).toString().trim();
                    r = b === c;
                    r && okn++;
                    if (!r) {
                        console.log('\n---------------------');
                        console.log('FAIL: ' + '\'' + rule + '\' / \'' + k + '.' + a);
                        console.log('\nExpected:\n', c);
                        console.log('\nResult:\n', b);
                        console.log();
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
