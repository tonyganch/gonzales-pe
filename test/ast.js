/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var src`) and run `node test/ast.js`.
 * Make sure to change `syntax` variable too, if needed.
 */
var src = 'div {$color: nani}',
    syntax = 'scss',
    cssToAST = require('./../lib/gonzales.cssp.node.js').cssToAST,
    astToCSS = require('./../lib/cssp.translator.node.js').astToCSS,
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
    ast = cssToAST({src: src, syntax: syntax});

    console.log("\n== Source string:\n", src);

    console.log("\n== AST:\n", astToTree(ast));

    console.log("\n== Translated string:\n", astToCSS({src: ast, syntax: syntax}));
