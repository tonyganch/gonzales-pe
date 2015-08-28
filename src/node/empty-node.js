'use strict';

var Node = require('./basic-node');
var NodeTypes = require('./node-types');

module.exports = function() {
  return new Node({
    type: NodeTypes.StylesheetType,
    content: [],
    start: [0, 0],
    end: [0, 0]
  });
};
