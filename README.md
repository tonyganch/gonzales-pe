[![Build Status](https://travis-ci.org/tonyganch/gonzales-pe.svg)]
(https://travis-ci.org/tonyganch/gonzales-pe)

# Gonzales PE @dev

Gonzales PE is a CSS parser which plays nicely with preprocessors.    
Currently those are supported: SCSS, Sass, LESS.

## Install

To install command-line tool globally:

```bash
npm install -g git://github.com/tonyganch/gonzales-pe.git#dev
```

To install parser as a project dependency:

```bash
npm install --save git://github.com/tonyganch/gonzales-pe.git#dev
```

If for some reason you want to build files yourself:

```bash
# Clone the repo.
git clone git@github.com:tonyganch/gonzales-pe.git
# Go to dev branch.
git checkout dev
# Install project dependencies.
npm install
# Install git hooks and build files.
npm run init
```

## API

### gonzales.createNode(options)

Creates a new node.

Parameters:

* `{{type: String, content: String|Array}} options`

Returns:

* `{Object} node`

Example:
```js
    var css = 'a {color: tomato}';
    var parseTree = gonzales.parse(css);
    var node = gonzales.createNode({ type: 'animal', content: 'panda' });
    parseTree.content.push(node);
```

### gonzales.parse(css, options)

Parse CSS.

Parameters:

* `{String} css`
* `{{syntax: String, rule: String}} options`

Returns:

* `{Object} parseTree`.

Example:
```js
    var css = 'a {color: tomato}';
    var parseTree = gonzales.parse(css);
```

Example:
```js
    var less = 'a {$color: tomato}';
    var parseTree = gonzales.parse(less, {syntax: 'less'});
```

Example:
```js
    var less = '$color: tomato';
    var parseTree = gonzales.parse(less, {syntax: 'less', rule: 'declaration'});
```

### parseTree.contains(type)

Checks whether there is a child node of given type.

Parameters:

* `{String} type`

Returns:

* `{Boolean}`

Example:
```js
    if (parseTree.contains('panda'))
        doSomething();
```

### parseTree.content

### parseTree.eachFor(type, callback)

### parseTree.end

### parseTree.first(type)

Returns the first child node of given type.

Parameters:

* `{String=} type`

Returns:

* `{Node} node`

Example:
```js
    var node = parseTree.first();
    node.content = 'panda';
```

Example:
```js
    var node = parseTree.first('commentML');
    node.content = 'panda';
```

### parseTree.forEach(type, function)

Calls the function for every child node of given type.

Parameters:

* `{String=} type`
* `{Function} function`

Example:
```js
    parseTree.forEach('commentML', function(node) {
        node.content = 'panda';
    });
```

### parseTree.get(index)

### parseTree.indexHasChanged

### parseTree.insert(index, node)

### parseTree.is(type)

Checks whether the node is of given type.

Parameters:

* `{String} type`

Returns:

* `{Boolean}`

Example:
```js
    if (parseTree.is('s'))
        parseTree.content = '';
```

### parseTree.last(type)

Returns the last child node of given type.

Parameters:

* `{String=} type`

Returns:

* `{Node} node`

Example:
```js
    var node = parseTree.last()
    node.content = 'panda';
```

Example:
```js
    var node = parseTree.last('commentML');
    node.content = 'panda';
```

### parseTree.length

### parseTree.remove(index)

### parseTree.start

### parseTree.syntax

### parseTree.toJson()

### parseTree.toString()

Converts parse tree to code.

Parameters:

* `{String} syntax`

Returns:

* `{String} css`

Example:
```js
    var css = parseTree.toCSS('css');
    var less = parseTree.toCSS('less');
```

### parseTree.traverse(function)

Calls the function for every node in a tree. Modifies the tree!

Parameters:

* `{Function} function`

Example:
```js
    parseTree.map(function(node) {
        if (node.type === 'commentML') node.content = 'panda';
    });
```

### parseTree.traverseByType(type, callback)

### parseTree.traverseByTypes(types, callback)

### parseTree.type


## Test

To run tests:

    npm test

This command will build library files from sources and run tests on all files
in syntax directories.

Every test has 3 files: source stylesheet, expected parse tree and expected
string compiled back from parse tree to css.

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
