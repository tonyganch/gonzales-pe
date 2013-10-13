### Gonzales CSSP usage

#### 1. Sample

With the help of this sample, you can check if Gonzales is installed correctly and if its (three) functions are working properly.

It is assumed that in the production code you will change AST in a more intelligent way.

Sample code:

    var gonzales = require('gonzales'),
        src = 'a { color: red }',
        ast = gonzales.cssToAST(src);

    console.log('== SRC:');
    console.log(src);

    console.log('\n== SRC -> AST:');
    console.log(gonzales.astToTree(ast));

    ast[1][1][1][1][1] = 'b';

    console.log('\n== AST\':');
    console.log(gonzales.astToTree(ast));

    console.log('\n== AST\' -> SRC:');
    console.log(gonzales.astToCSS(ast));
Result:

    == SRC:
    a { color: red }

    == SRC -> AST:
    ['stylesheet', 
      ['ruleset', 
        ['selector', 
          ['simpleselector', 
            ['ident', 'a'], 
            ['s', ' ']]], 
        ['block', 
          ['s', ' '], 
          ['declaration', 
            ['property', 
              ['ident', 'color']], 
            ['value', 
              ['s', ' '], 
              ['ident', 'red'], 
              ['s', ' ']]]]]]

    == AST':
    ['stylesheet', 
      ['ruleset', 
        ['selector', 
          ['simpleselector', 
            ['ident', 'b'], 
            ['s', ' ']]], 
        ['block', 
          ['s', ' '], 
          ['declaration', 
            ['property', 
              ['ident', 'color']], 
            ['value', 
              ['s', ' '], 
              ['ident', 'red'], 
              ['s', ' ']]]]]]

    == AST' -> SRC:
    b { color: red }

#### 2. API

In Node.js you can use Gonzales module this way: `gonzales = require('gonzales')`.

You can use CSSP AST through the next functions.

##### SRC -> AST

It parses source style to AST: `gonzales.cssToAST(src, rule, needInfo)`, where:

* `src` — a string with the CSS style;
* `rule` —  a string with the token type (in case the style is not complete);  for example, you want to parse only *declaration*, then you have to call `cssToAST('color: red', 'declaration')`; in case the style is complete and you don't need an info-object, the call is shortned to `cssToAST(src)`;
* `needInfo` — whether to include info-object into AST; in most cases you don't need it, but if it is included, you have to pass this `true` value in all functions with `needInfo` argument in signature.

##### AST -> SRC

Translates AST to style: `gonzales.astToCSS(ast, hasInfo)`, where:

* `ast` — AST to be translated;
* `needInfo` — whether an info-object is included into AST; in case it was when the style was parsed, you have to make it `true` here as well.

##### AST -> TREE

Translates AST to the string representation of the tree: `gonzales.astToTree(ast)`, where:

* `ast` — AST to be translated.

This function is useful for debugging or learning purposes.
