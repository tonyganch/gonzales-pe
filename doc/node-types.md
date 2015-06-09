# Node types

Here is a list of all node types that you can meet in AST.
Some of them, for example variable and mixins, are used only with specific
syntaxes.
Example AST shows only node's type and content, though additional properties and
methods may be available. Please see README for API reference.

### arguments

### atkeyword

Word that starts with a `@`, usually used in @-rules.

Used in syntaxes: css, less, sass, scss.

Example:
```js
// String:
@import

// AST:
{
  type: 'atkeyword',
  content: [{
    type: 'ident',
    content: 'import'
  }]
}
```

### atruleb

@-rule that consists of @-keyword, optional selectors and a block.

Used in syntaxes: css.

Example:
```js
// String:
@test{p:v}

// AST:
{
  type: 'atruleb',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'test'
    }]
  }, {
    type: 'block',
    content: [{
      type: 'declaration',
      content: [{
        type: 'property',
        content: [{
          type: 'ident',
          content: 'p'
        }]
      }, {
        type: 'propertyDelimiter',
        content: ':'
      }, {
        type: 'value',
        content: [{
          type: 'ident',
          content: 'v'
        }]
      }]
    }]
  }]
}
```

### atruler

### atrulerq

### atrulers

### atrules

### attribute

### attributeSelector

### block

### brackets

### class

### color

### combinator

### id

### multilineComment

### condition

### conditionalStatement

### declaration

### declarationDelimiter

### default

### delimiter

### dimension

### escapedString

### extend

### expression

### function

### ident

### important

### include

### interpolatedVariable

### interpolation

### loop

### mixin

### namespace

### nth

### nthSelector

### number

### operator

### parentheses

### parentSelector

### percentage

### placeholder

### progid

### property

### propertyDelimiter

### pseudoClass

### pseudoElement

### raw

### ruleset

### space

### selector

### simpleSelector

### singlelineComment

### string

### stylesheet

### unaryOperator

### uri

### value

### variable

### variablesList
