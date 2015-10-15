'use strict';

var Node = require('./node/basic-node');
var parse = require('./parse');

global.registeredSyntaxes = {};

var exports = {
  createNode: function(options) {
    return new Node(options);
  },
  registerSyntax : function(objects, type) {
    global.registeredSyntaxes[type] = objects;
    return objects;
  },
  getSyntax: function(type) {
    if (global.registeredSyntaxes[type] !== undefined) {
      return global.registeredSyntaxes[type];
    } else {
      return null;
    }
  }
};

exports.parse = parse.bind(null, exports);

module.exports = exports;