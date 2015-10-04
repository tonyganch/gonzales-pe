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

### atrule

### attributeFlags

### attributeMatch

### attributeName

### attributeSelector

### attributeValue

### block

### brackets

### class

### color

### combinator

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

### global

### id

### ident

### important

### include

### interpolatedVariable

### interpolation

### loop

### mixin

### multilineComment

### namePrefix

### namespacePrefix

### namespaceSeparator

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

### singlelineComment

### string

### stylesheet

### typeSelector

### uri

### value

### variable

### variablesList
