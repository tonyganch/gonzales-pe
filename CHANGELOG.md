# Changelog

#### Legend:

:japanese_ogre: — be afraid of this change because it breaks the way things
worked before.  
:star: — some new thing has been added.  
:green_apple: — some bad thing has been fixed.  

## 19.10.2015, Version 3.2.1

#### Parsing rules

:green_apple: Fixed the issue when selectors inside extends were not wrapped in
`selector` nodes in Sass and SCSS.  
:green_apple: Fixed parsing of multiple selectors in extends in Sass and SCSS.

## 19.10.2015, Version 3.2.0

#### Node types

:star: Added new node type: `parentSelectorExtension`.

#### Parsing rules

:green_apple: Fixed parsing of parent selectors with extensions, like
`&__element` or `&--modifier`.

## 19.10.2015, Version 3.1.1

#### Parsing rules

:green_apple: Fixed parsing of selectors starting or ending with a combinator
in Less, Sass and SCSS.

## 18.10.2015, Version 3.1.0

#### CLI

:green_apple: Fixed passing a `--context` argument.  
:green_apple: Fixed printing of a simplified tree.  

#### Node types

:star: Added new node type: `keyframesSelector`.  

#### Parsing rules

:green_apple: Fixed parsing of keyframes in all syntaxes.  

## 18.10.2015, Version 3.0.3

#### Parsing rules

:green_apple: Fixed parsing of spaces inside interpolations in Sass and SCSS.  

## 18.10.2015, Version 3.0.2

#### Parsing rules

:green_apple: Fixed the issue when operators were parsed as idents inside
parentheses in Sass and SCSS.  

## 18.10.2015, Version 3.0.1

#### Parsing rules
:green_apple: Fixed parsing of parent selectors in SCSS and Less.  
:green_apple: Fixed parsing of placeholders inside selectors in SCSS.  

## 18.10.2015, Version 3.0.0

#### CLI

:japanese_ogre: Made cli process stdin only if `-` argument is passed.  
:star: Added help message.  

#### API

:japanese_ogre: Renamed `parseTree.remove` to `parseTree.removeChild()`.  
:japanese_ogre: Unwraped callback parameters for `traverse...` methods.  
:japanese_ogre: Made `first()`, `last()` and `get()` methods return `null` if no child nodes were found.  
:japanese_ogre: Made `node.length` return a number of child nodes.  
:japanese_ogre: Renamed `rule` to `context`.  
:star: Made `parseTree.removeChild()` return a removed node.  
:star: Added `traverseBy...` methods to all nodes, not only root ones.  
:star: Added support for specifying a tab size in spaces.  

#### Parsing rules

:green_apple: Fixed parsing of single-line comments after `url` token.  
:green_apple: Fixed parsing of interpolations inside id selectors in Less.  
:green_apple: Fixed parsing of selectors according to spec.  
:green_apple: Fixed parsing of placeholders as selectors in SCSS.  

#### Misc

:star: Added Travis badge to Readme page.  
:star: Added init script to build sources.  
:star: Added commit message template.  

## 05.10.2015, Version 3.0.0-beta

#### CLI

:star: Added `--simple` flag for printing a simplified tree structure.  
:green_apple: CLI now prints parse tree to stdout.  

#### API

:japanese_ogre: Parse tree is now represented as objects, not arrays.  
:japanese_ogre: Renamed `gonzales.srcToAST()` to `gonzales.parse()`.
See [Readme](README.md#gonzalesparsecss-options).  
:japanese_ogre: Renamed `gonzales.astToSrc()` to `parseTree.toString()`.
See [Readme](README.md#parsetreetostring).  
:japanese_ogre: Renamed `gonzales.astToString()` to `parseTree.toJson()`.
See [Readme](README.md#parsetreetojson).  
:star: Added information about column number to nodes.  
:star: Added information about end position to nodes.  
:green_apple: Made empty strings to be parsed as empty nodes.  

#### Node types

:japanese_ogre: In Sass renamed `interpolatedVariable` to `interpolation`.  
:japanese_ogre: Separated `include` and `extend` nodes.  
:japanese_ogre: Replaced `filter` with `declaration`.  
:japanese_ogre: Replaced `braces` with `brackets` and `parentheses`.  
:japanese_ogre: Replaced `atrulers` with `block`.  
:japanese_ogre: Renamed `nthSelector` to `pseudoClass`.  
:japanese_ogre: Renamed `atrules`, `atruler` and `atruleb` to `atrule`.  
:japanese_ogre: Renamed `functionBody` to `arguments`.  
:japanese_ogre: Renamed `functionExpression` to `expression`.  
:japanese_ogre: Renamed `attrib` to `attributeSelector`.  
:japanese_ogre: Renamed `attrselector` to `attributeMatch`.  
:japanese_ogre: Renamed `commentSL` to `singlelineComment`.  
:japanese_ogre: Renamed `commentML` to `multilineComment`.  
:japanese_ogre: Renamed `declDelim` to `declarationDelimiter`.  
:japanese_ogre: Renamed `delim` to `delimiter`.  
:japanese_ogre: Renamed `propertyDelim` to `propertyDelimiter`.  
:japanese_ogre: Renamed `pseudoc` to `pseudoClass`.  
:japanese_ogre: Renamed `pseudoe` to `pseudoElement`.  
:japanese_ogre: Renamed `s` to `space`.  
:japanese_ogre: Renamed `shash` to `color`.  
:japanese_ogre: Renamed `vhash` to `id`.  
:japanese_ogre: Removed `atrulerq`, `unary` and `unknown`.  
:star: Added `attributeFlags`.  
:star: Added `attributeName`.  
:star: Added `attributeValue`.  
:star: Added `conditionalStatement`.  
:star: Added `namePrefix`.  
:star: Added `namespacePrefix`.  
:star: Added `namespaceSeparator`.  
:star: Added `typeSelector`.  

#### Parsing rules

:japanese_ogre: Spaces that separate two nodes are now put between those
nodes in parse tree.  
:star: Added support for `extend` nodes in Less.  
:star: Added support for equality and inequality signs in Sass and SCSS.  
:star: Added support for `/deep/` combinator.  
:star: Added support for `!optional` and `!global` in Sass and SCSS.  
:green_apple: Fixed parsing of interpolations in Sass and SCSS.  
:green_apple: Fixed parsing of arguments in Sass, SCSS and Less.  
:green_apple: Fixed parsing of declaration delimiters in Sass.  
:green_apple: Fixed the issue when pseudo-classes were parsed like declarations.  
:green_apple: Fixed parsing of selectors on multiple lines in Sass.  
:green_apple: Fixed parsing of percent sign as operator in SCSS.  
:green_apple: Fixed parsing of pseudo-elements as selectors in Sass.  

#### Misc

:star: Added Babel to build source files.  
:star: Used mocha for tests.  
:star: Added helper scripts.  
:star: Added Travis config.  
:rocket: Improved tests structure.  
:rocket: Separated log and test scripts.  
:rocket: Improved error messages.  
:rocket: Removed benchmark tests.  
:rocket: Moved source files from `lib` to `src` directory.  
:rocket: Made package availbale for install from GitHub.  

## 29.12.2013, Version 2.0.2

- Sass includes can have both arguments list and content block,
  i.e. `@include nani() { color: tomato }` is valid syntax.

## 18.11.2013, Version 2.0.1

- Bring back lost whitespaces and comments

## 11.11.2013, Version 2.0.0

- Support preprocessors: Sass (both SCSS and indented syntax), LESS.
- New node types:
    - `arguments` (less and sass only)
    - `commentML`
    - `commentSL` (less and sass only)
    - `condition` (sass only)
    - `default` (sass only)
    - `escapedString` (less only)
    - `include` (less and sass only)
    - `loop` (sass only)
    - `mixin` (less and sass only)
    - `parentselector` (less and sass only)
    - `placeholder` (sass only)
    - `propertyDelim`
    - `variable` (less and sass only)
    - `varialeList` (less and sass only)
- Rename methods:
    - `srcToCSSP` -> `cssToAST`
    - `csspToSrc` -> `astToCSS`
    - `csspToTree` -> `astToTree`
- Pass all arguments as one object:
    - `gonzales.cssToAST({css: a, syntax: b, rule: c, needInfo: d})`
    - `gonzales.astToCSS({ast: ast, syntax: syntax})`
- Remove built files from VCS
- Move test command from `make` to `npm`
- Build files before running tests
- Divide tests into groups according to syntax
- Add script to test one specific css string
- Add token's index number to info object

## 11.02.2013, Version 1.0.7

- Identifiers like `_0` are identifiers now.
- Throw error instead of console.error: https://github.com/css/csso/issues/109

## 25.11.2012, Version 1.0.6

- Typo fix (global variable leak): https://github.com/css/csso/pull/110
- Attribute selectors extended by `|`.
- `not(..)` pseudo-class special support: https://github.com/css/csso/issues/111

## 28.10.2012, Version 1.0.5

- Better error line numbering: https://github.com/css/gonzales/issues/2

## 11.10.2012, Version 1.0.4

- CSSO issue (@page inside @media error): https://github.com/css/csso/issues/90

## 10.10.2012, Version 1.0.3

- Both .t-1 and .t-01 should be idents: https://github.com/css/gonzales/issues/1

## 08.10.2012, Version 1.0.2

- CSSO issue (filter + important breaks csso v1.3.1): https://github.com/css/csso/issues/87

## 08.10.2012, Version 1.0.1

- CSSO issue ("filter" IE property breaks CSSO v1.3.0): https://github.com/css/csso/issues/86

## 03.10.2012, Version 1.0.0

- First revision.
