/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var src`) and run `node test/ast.js`.
 */
var src = 'div {$color: nani}',
    srcToCSSP = require('./../lib/gonzales.cssp.node.js').srcToCSSP,
    csspToSrc = require('./../lib/cssp.translator.node.js').csspToSrc,
    csspToTree = function(tree, level) {
        var spaces = dummySpaces(level),
            level = level ? level : 0,
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
    ast = srcToCSSP(src);

    console.log("\n== Source string:\n", src);

    console.log("\n== AST:\n", csspToTree(ast));

    console.log("\n== Translated string:\n", csspToSrc(ast));
