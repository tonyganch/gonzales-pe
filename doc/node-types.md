# Node types

Here is a list of all node types that you can meet in a parse tree.
Some of them, for example variable and mixins, are used only with specific
syntaxes.
Example nodes show only node's type and content, though additional properties and
methods may be available. Please see [README](README.md) for API reference.

- [arguments](#arguments)
- [atkeyword](#atkeyword)
- [atrule](#atrule)
- [attributeFlags](#attributeflags)
- [attributeMatch](#attributematch)
- [attributeName](#attributename)
- [attributeSelector](#attributeselector)
- [attributeValue](#attributevalue)
- [block](#block)
- [brackets](#brackets)
- [class](#class)
- [color](#color)
- [combinator](#combinator)
- [condition](#condition)
- [conditionalStatement](#conditionalstatement)
- [declaration](#declaration)
- [declarationDelimiter](#declarationdelimiter)
- [default](#default)
- [delimiter](#delimiter)
- [dimension](#dimension)
- [escapedString](#escapedstring)
- [extend](#extend)
- [expression](#expression)
- [function](#function)
- [global](#global)
- [id](#id)
- [ident](#ident)
- [important](#important)
- [include](#include)
- [interpolatedVariable](#interpolatedvariable)
- [interpolation](#interpolation)
- [loop](#loop)
- [mixin](#mixin)
- [multilineComment](#multilinecomment)
- [namePrefix](#nameprefix)
- [namespacePrefix](#namespaceprefix)
- [namespaceSeparator](#namespaceseparator)
- [number](#number)
- [operator](#operator)
- [parentheses](#parentheses)
- [parentSelector](#parentselector)
- [percentage](#percentage)
- [placeholder](#placeholder)
- [progid](#progid)
- [property](#property)
- [propertyDelimiter](#propertydelimiter)
- [pseudoClass](#pseudoclass)
- [pseudoElement](#pseudoelement)
- [raw](#raw)
- [ruleset](#ruleset)
- [space](#space)
- [selector](#selector)
- [singlelineComment](#singlelinecomment)
- [string](#string)
- [stylesheet](#stylesheet)
- [typeSelector](#typeselector)
- [uri](#uri)
- [value](#value)
- [variable](#variable)
- [variablesList](#variableslist)


### arguments

##### Description

A list of function/mixin arguments, including parentheses.    

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
()

// Parse tree
{
  type: 'arguments',
  content: []
}
```

```js
// String
(a)

// Parse tree
{
  type: 'arguments',
  content: [{
    type: 'ident',
    content: 'a'
  }]
}
```


### atkeyword

##### Description

Word that starts with a `@`, usually used in @-rules.

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
@import

// Parse tree
{
  type: 'atkeyword',
  content: [{
    type: 'ident',
    content: 'import'
  }]
}
```

##### References

[CSS 2.1](http://www.w3.org/TR/CSS21/syndata.html#tokenization)


### atrule

##### Description

At-rules start with an at-keyword, an '@' character followed immediately by an identifier (for example, '@import', '@page').
An at-rule consists of everything up to and including the next semicolon (;) or the next block, whichever comes first.

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
@import "subs.css";

// Parse tree
{
  type: 'atrule',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'import'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'string',
    content: '"subs.css"'
  }]
}
```

##### References

[CSS 2.1](http://www.w3.org/TR/CSS21/syndata.html#at-rules)


### attributeFlags

##### Description

An identifier used to toggle case-sensitivity in attribute selectors.

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
i

// Parse tree
{
  type: 'attributeFlags',
  content: [{
    type: 'ident',
    content: 'i'
  }]
}
```

##### References

[CSS Selectors Level 4](http://www.w3.org/TR/selectors4/#attribute-case)


### attributeMatch

##### Description

A group of characters separating attribute name and attribute value.

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
=

// Parse tree
{
  type: 'attributeMatch',
  content: '='
}
```

##### References

[CSS Selectors Level 4](http://www.w3.org/TR/selectors4/#grammar)


### attributeName

##### Description

Attribute selector's name.

Used in syntaxes: css, less, sass, scss.

##### Example

```js
// String
panda

// Parse tree
{
  type: 'attributeName',
  content: [{
    type: 'ident',
    content: 'panda'
  }]
}
```


### attributeSelector

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
a=b

// Parse tree
{
  type: 'attributeSelector',
  content: [{
    type: 'attributeName',
    content: [{
      type: 'ident',
      content: 'a'
    }]
  }, {
    type: 'attributeMatch',
    content: '=',
  }, {
    type: 'attributeValue',
    content: [{
      type: 'ident',
      content: 'b',
    }]
  }]
}
```

### attributeValue

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
b

// Parse tree
{
  type: 'attributeValue',
  content: [{
    type: 'ident',
    content: 'b',
  }]
}
```


### block

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
{}

// Parse tree
{
  type: 'block',
  content: []
}
```

```js
// String
{ }

// Parse tree
{
  type: 'block'
  content: [{
    type: 'space',
    content: '  '
  }]
}
```


### brackets

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
[]

// Parse tree
{
  type: 'brackets',
  content: []
}
```

```js
// String
[1]

// Parse tree
{
  type: 'brackets',
  content: [{
    type: 'number',
    content: '1',
  }]
}
```


### class

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
.panda

// Parse tree
{
  type: 'class',
  content: [{
    type: 'ident',
    content: 'panda'
  }]
}
```


### color

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### combinator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### condition

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### conditionalStatement

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### declaration

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### declarationDelimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### default

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### delimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### dimension

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### escapedString

##### Description

Used in syntaxes: less.

##### Examples

```js
// String

// Parse tree
{
}
```


### extend

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### expression

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### function

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### global

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### id

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### ident

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### important

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### include

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### interpolatedVariable

##### Description

Used in syntaxes: less.

##### Examples

```js
// String

// Parse tree
{
}
```


### interpolation

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### loop

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### mixin

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### multilineComment

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### namePrefix

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### namespacePrefix

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### namespaceSeparator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### number

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### operator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### parentheses

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### parentSelector

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### percentage

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### placeholder

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### progid

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### property

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### propertyDelimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### pseudoClass

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### pseudoElement

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### raw

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### ruleset

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### space

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### selector

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### singlelineComment

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### string

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### stylesheet

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### typeSelector

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### uri

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### value

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### variable

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String

// Parse tree
{
}
```


### variablesList

##### Description

Used in syntaxes: less.

##### Examples

```js
// String

// Parse tree
{
}
```

