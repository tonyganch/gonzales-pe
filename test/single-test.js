/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var css`) and run `node test/ast.js`.
 * Make sure to change `syntax` variable too, if needed.
 */
var css = 'a-23',
    syntax = 'css',
    rule = 'ident',
    gonzales = require('./../lib/gonzales'),
    ast = gonzales.srcToAST({src: css, syntax: syntax, rule: rule});

    console.log('\n== Source string:');
    console.log(css);

    console.log('\n== AST:');
    console.log(gonzales.astToString(ast));

    console.log('\n== Translated string:');
    console.log(gonzales.astToSrc({ast: ast, syntax: syntax}));
