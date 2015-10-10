# Gonzales PE @2.0.2

Gonzales PE is a CSS parser which plays nicely with preprocessors.    
Currently those are supported: SCSS, Sass, LESS.    

## Install

To install command-line tool globally:

```bash
npm install -g gonzales-pe@2.0.2
```

To install parser as a project dependency:

```bash
npm install --save gonzales-pe@2.0.2
```

If for some reason you want to build files yourself:

```bash
# Clone the repo.
git clone git@github.com:tonyganch/gonzales-pe.git
# Go to `2.0` branch.
git checkout 2.0
# Build files.
make
```

## Use

Require Gonzales in your project:

    var gonzales = require('gonzales-pe');

Do something:

    var css = 'a { color: tomato }';
    console.log(gonzales.cssToAST(css));

You can learn more about available methods on [Gonzales usage](doc/Gonzales-Usage.md) page.

AST is described on [Gonzales AST description](doc/AST-Description.md) page.

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

    node test/ast.js

Please remember to also run `make` every time you modify any source files.

## Report

If you find a bug or want to add a feature, welcome to [Issues](https://github.com/tonyganch/gonzales-pe/issues).

If you are shy but have a question, feel free to [drop me a
line](mailto:tonyganch+gonzales@gmail.com).
