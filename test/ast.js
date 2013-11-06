/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var css`) and run `node test/ast.js`.
 * Make sure to change `syntax` variable too, if needed.
 */
var css = 'div {$color: nani}',
    syntax = 'scss',
    gonzales = require('./../lib/gonzales'),
    astToTree = function(tree, level) {
        level = level || 0;
        var spaces = dummySpaces(level),
            s = (level ? '\n' + spaces : '') + '[';

        tree.forEach(function(e) {
            if (e.ln === undefined) {
                s += (Array.isArray(e) ? astToTree(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
            }
        });

        return s.substr(0, s.length - 2) + ']';
    },
    dummySpaces = function(num) {
        return '                                                  '.substr(0, num * 2);
    },
    ast = gonzales.cssToAST({css: css, syntax: syntax});

    console.log('\n== Source string:');
    console.log(css);

    console.log('\n== AST:');
    console.log(astToTree(ast));

    console.log('\n== Translated string:');
    console.log(gonzales.astToCSS({ast: ast, syntax: syntax}));
