# Node types

Here is a list of all node types that you can meet in a parse tree.
Some of them, for example variable and mixins, are used only with specific
syntaxes.
Example nodes show only node's type and content, though additional properties and
methods may be available. Please see [README](../README.md) for API reference.

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
- [keyframesSelector](#keyframesselector)
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
- [parentSelectorExtension](#parentselectorextension)
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
- [unicodeRange](#unicoderange)
- [universalSelector](#universalselector)
- [urange](#urange)
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
#fff

// Parse tree
{
  type: 'color',
  content: 'fff'
}
```


### combinator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
~

// Parse tree
{
  type: 'combinator',
  content: '~'
}
```


### condition

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
@if 1 > 2

// Parse tree
{
  type: 'condition',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'if'
    }],
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'number',
    content: '1'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'operator',
    content: '>'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'number',
    content: '2'
  }],
}
```


### conditionalStatement

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
@if 1 > 2 { color: tomato; }

// Parse tree
{
  type: 'conditionalStatement',
  content: [{
    type: 'condition',
    content: [{
      type: 'atkeyword',
      content: [{
        type: 'ident',
        content: 'if'
      }]
    }, {
      type: 'space',
      content: ' '
    }, {
      type: 'number',
      content: '1'
    }, {
      type: 'space',
      content: ' '
    }, {
      type: 'operator',
      content: '>'
    }, {
      type: 'space',
      content: ' '
    }, {
      type: 'number',
      content: '2'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'block',
    content: [{
      type: 'space',
      content: ' '
    }, {
      type: 'declaration',
      content: [{
        type: 'property',
        content: [{
          type: 'ident',
          content: 'color'
        }]
      }, {
        type: 'propertyDelimiter',
        content: ':'
      }, {
        type: 'space',
        content: ' '
      }, {
        type: 'value',
        content: [{
          type: 'ident',
          content: 'tomato'
        }]
      }]
    }, {
      type: 'declarationDelimiter',
      content: ';'
    }, {
      type: 'space',
      content: ' '
    }]
  }]
}
```


### declaration

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
a:b

// Parse tree
{
  type: 'declaration',
  content: [{
    type: 'property',
    content: [{
      type: 'ident',
      content: 'a'
    }]
  }, {
    type: 'propertyDelimiter',
    content: ':'
  }, {
    type: 'value',
    content: [{
      type: 'ident',
      content: 'b'
    }]
  }]
}
```


### declarationDelimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
;

// Parse tree
{
  type: 'declarationDelimiter',
  content: ';'
}
```


### default

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
!default

// Parse tree
{
  type: 'default',
  content: '!default'
}
```


### delimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
,

// Parse tree
{
  type: 'delimiter',
  content: ','
}
```


### dimension

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
10px

// Parse tree
{
  type: 'dimension',
  content: [{
    type: 'number',
    content: '10'
  }, {
    type: 'ident',
    content: 'px'
  }]
}
```


### escapedString

##### Description

Used in syntaxes: less.

##### Examples

```js
// String
~"nani"

// Parse tree
{
  type: 'escapedString',
  content: '"nani"'
}
```


### expression

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
expression()

// Parse tree
{
  type: 'expression',
  content: ''
}
```


### extend

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
@extend .nani

// Parse tree
{
  type: 'extend',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'extend'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'class',
    content: [{
      type: 'ident',
      content: 'nani'
    }]
  }]
}
```


### function

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
f(5)

// Parse tree
{
  type: 'function',
  content: [{
    type: 'ident',
    content: 'f'
  }, {
    type: 'arguments',
    content: [{
      type: 'number',
      content: '5'
    }]
  }]
}
```


### global

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
!global

// Parse tree
{
  type: 'global',
  content: '!global'
}
```


### id

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
#id

// Parse tree
{
  type: 'id',
  content: [{
    type: 'ident',
    content: 'id'
  }]
}
```


### ident

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
panda

// Parse tree
{
  type: 'ident',
  content: 'panda'
}
```


### important

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
!important

// Parse tree
{
  type: 'important',
  content: '!important'
}
```


### include

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
@include nani

// Parse tree
{
  type: 'include',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'include'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'ident',
    content: 'nani'
  }]
}
```


### interpolatedVariable

##### Description

Used in syntaxes: less.

##### Examples

```js
// String
@{nani}

// Parse tree
{
  type: 'interpolatedVariable',
  content: [{
    type: 'ident',
    content: 'nani'
  }]
}
```


### interpolation

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
#{$nani}

// Parse tree
{
  type: 'interpolation',
  content: [{
    type: 'variable',
    content: [{
      type: 'ident',
      content: 'nani'
    }]
  }]
}
```


### keyframesSelector

##### Description

Selector used in keyframes animations.
May be one of the following: `from`, `to` or any percentage.

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
from

// Parse tree
{
  type: 'keyframesSelector',
  content: [{
    type: 'ident',
    content: 'from'
  }]
}
```

##### References

[Keyframes spec](http://www.w3.org/TR/css3-animations/#keyframes)


### loop

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
@while 1 > 2 {a{p:v}}

// Parse tree
{
  type: 'loop',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'while'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'number',
    content: '1'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'operator',
    content: '>'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'number',
    content: '2'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'block',
    content: [{
      type: 'ruleset',
      content: [{
        type: 'selector',
        content: [{
          type: 'typeSelector',
          content: [{
            type: 'ident',
            content: "a"
          }]
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
    }]
  }]
}
```


### mixin

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
@mixin nani {color:tomato}

// Parse tree
{
  type: 'mixin',
  content: [{
    type: 'atkeyword',
    content: [{
      type: 'ident',
      content: 'mixin'
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'ident',
    content: 'nani'
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'block',
    content: [{
      type: 'declaration',
      content: [{
        type: 'property',
        content: [{
          type: 'ident',
          content: 'color'
        }]
      }, {
        type: 'propertyDelimiter',
        content: ':'
      }, {
        type: 'value',
        content: [{
          type: 'ident',
          content: 'tomato'
        }]
      }]
    }]
  }]
}
```


### multilineComment

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
/*test*/

// Parse tree
{
  type: 'multilineComment',
  content: 'test'
}
```


### namePrefix

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
panda|

// Parse tree
{
  type: 'namePrefix',
  content: [{
    type: 'namespacePrefix',
    content: [{
      type: 'ident',
      content: 'panda'
    }]
  }, {
    type: 'namespaceSeparator',
    content: '|'
  }]
}
```


### namespacePrefix

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
panda

// Parse tree
{
  type: 'namespacePrefix',
  content: [{
    type: 'ident',
    content: 'panda'
  }]
}
```


### namespaceSeparator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
|

// Parse tree
{
  type: 'namespaceSeparator',
  content: '|'
}
```


### number

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
10

// Parse tree
{
  type: 'number',
  content: '10'
}
```


### operator

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
/

// Parse tree
{
  type: 'operator',
  content: '/'
}
```


### optional

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
!optional

// Parse tree
{
  type: 'optional',
  content: '!optional'
}
```


### parentheses

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
(1)

// Parse tree
{
  type: 'parentheses',
  content: [{
    type: 'number',
    content: '1'
  }]
}
```


### parentSelector

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
&

// Parse tree
{
  type: 'parentSelector',
  content: '&'
}
```


### parentSelectorExtension

##### Description

Part that comes immediately after `&` but does not get compiled to a separate
selector. Consists of any combination of `ident` or `number`.

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
&2-panda

// Parse tree
{
  type: 'selector',
  content: [{
    type: 'parentSelector',
    content: '&'
  }, {
    type: 'parentSelectorExtension',
    content: [{
      type: 'number',
      content: '2'
    }, {
      type: 'ident',
      content: '-panda'
    }]
  }]
}
```


### percentage

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
10%

// Parse tree
{
  type: 'percentage',
  content: [{
    type: 'number',
    content: '10'
  }]
}
```


### placeholder

##### Description

Used in syntaxes: sass, scss.

##### Examples

```js
// String
%nani

// Parse tree
{
  type: 'placeholder',
  content: [{
    type: 'ident',
    content: 'nani'
  }]
}
```


### property

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
color

// Parse tree
{
  type: 'property',
  content: [{
    type: 'ident',
    content: 'color'
  }]
}
```


### propertyDelimiter

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
:

// Parse tree
{
  type: 'propertyDelimiter',
  content: ':'
}
```


### pseudoClass

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
:nth-child(2n+1)

// Parse tree
{
  type: 'pseudoClass',
  content: [{
    type: 'ident',
    content: 'nth-child'
  }, {
    type: 'arguments',
    content: [{
      type: 'number',
      content: '2'
    }, {
      type: 'ident',
      content: 'n'
    }, {
      type: 'operator',
      content: '+'
    }, {
      type: 'number',
      content: '1'
    }]
  }]
}
```


### pseudoElement

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
::after

// Parse tree
{
  type: 'pseudoElement',
  content: [{
    type: 'ident',
    content: 'after'
  }]
}
```


### ruleset

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
a{color:tomato}

// Parse tree
{
  type: 'ruleset',
  content: [{
    type: 'selector',
    content: [{
      type: 'typeSelector',
      content: [{
        type: 'ident',
        content: 'a'
      }]
    }]
  }, {
    type: 'block',
    content: [{
      type: 'declaration',
      content: [{
        type: 'property',
        content: [{
          type: 'ident',
          content: 'color'
        }]
      }, {
        type: 'propertyDelimiter',
        content: ':'
      }, {
        type: 'value',
        content: [{
          type: 'ident',
          content: 'tomato'
        }]
      }]
    }]
  }]
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
  type: 'space',
  content: '  '
}
```


### selector

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
.panda

// Parse tree
{
  type: 'selector',
  content: [{
    type: 'class',
    content: [{
      type: 'ident',
      content: 'panda'
    }]
  }]
}
```


### singlelineComment

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
//panda

// Parse tree
{
  type: 'singlelineComment',
  content: 'panda'
}
```


### string

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
"test"

// Parse tree
{
  type: 'string',
  content: '"test"',
}
```


### stylesheet

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
a {color: tomato} div {color: potato}

// Parse tree
{
  type: 'stylesheet',
  content: [{
    type: 'ruleset',
    content: [{
      type: 'selector',
      content: [{
        type: 'typeSelector',
        content: [{
          type: 'ident',
          content: 'a'
        }]
      }]
    }, {
      type: 'space',
      content: ' '
    }, {
      type: 'block',
      content: [{
        type: 'declaration',
        content: [{
          type: 'property',
          content: [{
            type: 'ident',
            content: 'color'
          }]
        }, {
          type: 'propertyDelimiter',
          content: ':'
        }, {
          type: 'space',
          content: ' '
        }, {
          type: 'value',
          content: [{
            type: 'ident',
            content: 'tomato'
          }]
        }]
      }]
    }]
  }, {
    type: 'space',
    content: ' '
  }, {
    type: 'ruleset',
    content: [{
      type: 'selector',
      content: [{
        type: 'typeSelector',
        content: [{
          type: 'ident',
          content: 'div'
        }]
      }]
    }, {
      type: 'space',
      content: ' '
    }, {
      type: 'block',
      content: [{
        type: 'declaration',
        content: [{
          type: 'property',
          content: [{
            type: 'ident',
            content: 'color'
          }]
        }, {
          type: 'propertyDelimiter',
          content: ':'
        }, {
          type: 'space',
          content: ' '
        }, {
          type: 'value',
          content: [{
            type: 'ident',
            content: 'potato'
          }]
        }]
      }]
    }]
  }]
}
```


### typeSelector

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
div

// Parse tree
{
  type: 'typeSelector',
  content: [{
    type: 'ident',
    content: 'div'
  }]
}
```


### unicodeRange

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
U+A5, U+4E00-9FFF

// Parse tree
{
  type: 'unicodeRange',
  content: [{
    type: 'urange',
    content: 'U+A5',
  },
  {
    type: 'delimiter',
    content: ','
  },
  {
    type: 'space',
    content: ' '
  },
  {
    type: 'urange',
    content: 'U+4E00-9FFF',
  }]
}
```


### universalSelector

##### Description

See https://www.w3.org/TR/css3-selectors/#universal-selector.
Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
*

// Parse tree
{
  type: 'universalSelector',
  content: []
}
```

```js
// String
ns|*

// Parse tree
{
  type: 'universalSelector',
  content: [{
    type: 'namePrefix',
    content: [{
      type: 'namespacePrefix',
      content: [{
        type: 'ident',
        content: 'ns'
      }]
    }, {
      type: 'namespaceSeparator',
      content: '|'
    }]
  }]
}
```


### urange

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
U+A5

// Parse tree
{
  type: 'urange',
  content: 'U+A5',
}
```


### uri

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
url("http://test.com")

// Parse tree
{
  type: 'uri',
  content: [{
    type: 'string',
    content: '"http://test.com"'
  }]
}
```


### value

##### Description

Used in syntaxes: css, less, sass, scss.

##### Examples

```js
// String
tomato

// Parse tree
{
  type: 'value',
  content: [{
    type: 'ident',
    content: 'tomato'
  }]
}
```


### variable

##### Description

Used in syntaxes: less, sass, scss.

##### Examples

```js
// String
$panda

// Parse tree
{
  type: 'variable',
  content: [{
    type: 'ident',
    content: 'panda'
  }]
}
```


### variablesList

##### Description

Used in syntaxes: less.

##### Examples

```js
// String
$colors...

// Parse tree
{
  type: 'variablesList',
  content: [{
    type: 'variable',
    content: [{
      type: 'ident',
      content: 'colors'
    }]
  }]
}
```
