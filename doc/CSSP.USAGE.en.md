### Gonzales CSSP usage

#### 1. Sample

By this sample you can check your Gonzales installation validness and the work of its functions.

Is it assumed that in the production code you will change AST in more intelligent way.

Sample code:

    var gonzales = require('gonzales'),
        src = 'a { color: red }',
        ast = gonzales.srcToCSSP(src);

    console.log('== SRC:');
    console.log(src);

    console.log('\n== SRC -> AST:');
    console.log(gonzales.csspToTree(ast));

    ast[1][1][1][1][1] = 'b';

    console.log('\n== AST\':');
    console.log(gonzales.csspToTree(ast));

    console.log('\n== AST\' -> SRC:');
    console.log(gonzales.csspToSrc(ast));
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

In Node.js you can use Gonzales module in this way: `gonzales = require('gonzales')`.

You can use CSSP AST through the next functions.

##### SRC -> AST

Parses source style to AST: `gonzales.srcToCSSP(src, rule, needInfo)`, where:

* `src` — string with the CSS style;
* `rule` — string with the token type in case the style is not whole; for example you want to parse only *declaration*, so it is needed to call `srcToCSSP('color: red', 'declaration')`; in case the style is whole and you don't need info-object, the call is shortned to `srcToCSSP(src)`;
* `needInfo` — include an info-object into AST; in most cases you don't need it, but if you included that, you must pass this `true` value in all functions with `needInfo` argument in signature.

##### AST -> SRC

Translates AST to style: `gonzales.csspToSrc(ast, hasInfo)`, where:

* `ast` — AST to translate;
* `needInfo` — include an info-object into AST; in case it was while parsing of the style into AST, you need to make it `true` here too.

##### AST -> TREE

Translates AST to the string representation of the tree: `gonzales.csspToTree(ast)`, where:

* `ast` — AST to translate.

This function is useful for debug or learning purposes.
