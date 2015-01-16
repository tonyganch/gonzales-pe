## API

### gonzales.parse(css, options)

Parse CSS.

Parameters:

* `{String} css`
* `{{syntax: String, rule: String}} options`

Returns:

* `{Object} ast`.

Example:

    var css = 'a {color: tomato}';
    var ast = gonzales.parse(css);

Example:

    var less = 'a {$color: tomato}';
    var ast = gonzales.parse(less, {syntax: 'less'});

Example:

    var less = '$color: tomato';
    var ast = gonzales.parse(less, {syntax: 'less', rule: 'declaration'});

### ast.toString()

### ast.toCSS(syntax)

Converts AST to code.

Parameters:

* `{String} syntax`

Returns:

* `{String} css`

Example:

    var css = ast.toCSS('css');
    var less = ast.toCSS('less');

### ast.map(function)

Calls the function for every node in a tree. Modifies the tree!

Parameters:

* `{Function} function`

Example:

    ast.map(function(node) {
        if (node.type === 'commentML') node.content = 'panda';
    });

## Test

To run tests:

    npm test

This command will build library files from sources and run tests on all files
in syntax directories.

Every test has 3 files: source stylesheet, expected AST and expected string
compiled back from AST to css.

If some tests fail, you can find information in test logs:

- `log/test.log` contains all information from stdout;
- `log/expected.txt` contains only expected text;
- `log/result.txt` contains only result text.

The last two are made for your convenience: you can use any diff app to see
the defference between them.

If you want to test one specific string or get a general idea of how Gonzales
works, you can use `test/ast.js` file.    
Simply change the first two strings (`css` and `syntax` vars) and run:

    node test/single-test.js

## Report

If you find a bug or want to add a feature, welcome to [Issues](https://github.com/tonyganch/gonzales-pe/issues).

If you are shy but have a question, feel free to [drop me a
line](mailto:tonyganch+gonzales@gmail.com).
