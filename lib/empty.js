var Node = require('./node');
var NodeTypes = require('./node-types');

module.exports = function() {
  return new Node({
      type: NodeTypes.SType,
      content: '',
      start: [0, 0],
      end: [0, 0]
  });
};