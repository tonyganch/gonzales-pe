var Node = require('./node');
var parse = require('./parse');

module.exports = {
    createNode: function(type, content) {
        return new Node(type, content);
    },
    parse: parse
}
