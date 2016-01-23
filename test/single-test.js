/* Check one specific css string without creating test files.
 * Print AST and string translated from AST.
 * Just change the first line (`var css`) and run `node test/ast.js`.
 * Make sure to change `syntax` variable too, if needed.
 */
var css = '@include keyframes(foo) { 0% {}}',
    syntax = 'scss',
    rule = 'ident',
    gonzales = require('./..'),
    ast = gonzales.parse(css, {syntax: syntax, rule: rule});

    console.log('\n== Source string:');
    console.log(css);

    console.log('\n== AST:');
    console.log(ast.toJson());

    console.log('\n== Translated string:');
    console.log(ast.toString());
