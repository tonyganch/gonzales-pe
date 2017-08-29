'use strict';

module.exports = function stringify(tree) {
  // TODO: Better error message
  if (!tree) throw new Error('We need tree to translate');

  function _t(tree) {
    var type = tree.type;
    if (_unique[type]) return _unique[type](tree);
    if (typeof tree.content === 'string') return tree.content;
    if (Array.isArray(tree.content)) return _composite(tree.content);
    return '';
  }

  function _composite(t, i) {
    if (!t) return '';

    var s = '';
    i = i || 0;
    for (; i < t.length; i++) s += _t(t[i]);
    return s;
  }

  var _unique = {
    'arguments': function(t) {
      return '(' + _composite(t.content) + ')';
    },
    'atkeyword': function(t) {
      return '@' + _composite(t.content);
    },
    'attributeSelector': function(t) {
      return '[' + _composite(t.content) + ']';
    },
    'block': function(t) {
      return '{' + _composite(t.content) + '}';
    },
    'brackets': function(t) {
      return '[' + _composite(t.content) + ']';
    },
    'class': function(t) {
      return '.' + _composite(t.content);
    },
    'color': function(t) {
      return '#' + t.content;
    },
    'customProperty': function(t) {
      return '--' + t.content;
    },
    'expression': function(t) {
      return 'expression(' + t.content + ')';
    },
    'id': function(t) {
      return '#' + _composite(t.content);
    },
    'multilineComment': function(t) {
      return '/*' + t.content + '*/';
    },
    'nthSelector': function(t) {
      return ':' + _t(t.content[0]) +
        '(' + _composite(t.content.slice(1)) + ')';
    },
    'parentheses': function(t) {
      return '(' + _composite(t.content) + ')';
    },
    'percentage': function(t) {
      return _composite(t.content) + '%';
    },
    'pseudoClass': function(t) {
      return ':' + _composite(t.content);
    },
    'pseudoElement': function(t) {
      return '::' + _composite(t.content);
    },
    'universalSelector': function(t) {
      return _composite(t.content) + '*';
    },
    'uri': function(t) {
      return 'url(' + _composite(t.content) + ')';
    }
  };

  return _t(tree);
};
