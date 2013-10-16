### Gonzales CSSP usage

#### 1. Sample

With the help of this sample, you can check if Gonzales is installed correctly and if its (three) functions are working properly.

It is assumed that in the production code you will change AST in a more intelligent way.

Sample code:

    var gonzales = require('gonzales-pe'),
        src = 'a { color: red }',
        ast = gonzales.cssToAST(src);

    console.log('== CSS:');
    console.log(src);

    console.log('\n== CSS -> AST:');
    console.log(gonzales.astToTree(ast));

    ast[1][1][1][1][1] = 'b';

    console.log('\n== AST\':');
    console.log(gonzales.astToTree(ast));

    console.log('\n== AST\' -> CSS:');
    console.log(gonzales.astToCSS(ast));

Result:

    == CSS:
    a { color: red }

    == CSS -> AST:
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

    == AST' -> CSS:
    b { color: red }

#### 2. API

In Node.js you can use Gonzales module this way:
```
gonzales = require('gonzales-pe');
```

You can use AST through the next functions.

##### CSS -> AST

It parses source style to AST:
```
gonzales.cssToAST({
  css: css,
  rule: rule,
  needInfo: true,
  syntax: 'scss'
})
```
where:

- `css` — a string with the CSS style;
- `rule` —  a string with the token type (in case the style is not complete);
- `needInfo` — whether to include info object into AST;
- `syntax` — a string with syntax name (`css` is default).

Example 1: if you want to parse only *declaration*, you have to call:
```
cssToAST({
  css: 'color: red',
  rule: 'declaration'
});
```

Example 2: in case the style is complete and you don't need an info object,
the call is shortned to:
```
cssToAST(src);
```

##### AST -> CSS

Translates AST to style:
```
gonzales.astToCSS({
  ast: ast,
  syntax: 'scss'
})
```
where:

- `ast` — AST to be translated;
- `syntax` — a string with syntax name (`css` is default).

##### AST -> TREE

Translates AST to the string representation of the tree:
```
gonzales.astToTree(ast);
```
where:

- `ast` — AST to be translated.

This function is useful for debugging or learning purposes.
