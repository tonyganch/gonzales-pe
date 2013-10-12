/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var src`) and run `node test/ast.js`.
 * Make sure to change `syntax` variable too, if it's needed.
 */
var src = 'div {$color: nani}',
    syntax = 'scss',
    srcToCSSP = require('./../lib/gonzales.cssp.node.js').srcToCSSP,
    csspToSrc = require('./../lib/cssp.translator.node.js').csspToSrc,
    csspToTree = function(tree, level) {
        level = level || 0;
        var spaces = dummySpaces(level),
            s = (level ? '\n' + spaces : '') + '[';

        tree.forEach(function(e) {
            if (e.ln === undefined) {
                s += (Array.isArray(e) ? csspToTree(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
            }
        });

        return s.substr(0, s.length - 2) + ']';
    },
    dummySpaces = function(num) {
        return '                                                  '.substr(0, num * 2);
    },
    ast = srcToCSSP({src: src, syntax: syntax});

    console.log("\n== Source string:\n", src);

    console.log("\n== AST:\n", csspToTree(ast));

    console.log("\n== Translated string:\n", csspToSrc({tree: ast, syntax: syntax}));
