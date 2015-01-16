/**
 * @param {string} type
 * @param {array|string} content
 * @param {number} line
 * @param {number} column
 * @constructor
 */
function Node(type, content, line, column) {
    this.type = type;
    this.content = content || null;
    this.start = {
        line: line,
        column: column
    };
}

Node.prototype = {
    type: null,

    content: null,

    start: null,

    /**
     * @param {Function} callback
     */
    map: function(callback) {
        callback(this);

        if (!Array.isArray(this.content)) return;

        this.content.forEach(function(node) {
            if (node instanceof Node)
                node.map(callback);
        });
    },

    toString: function() {
        return JSON.stringify(this, false, 2);
    },

    //TODO(tonyganch): Save syntax name while creating a node.
    toCSS: function(syntax) {
        if (!syntax) return console.error('Empty syntax name.');

        try {
            stringify = require('./' + syntax + '/stringify');
        } catch (e) {
            var message = 'Syntax "' + syntax + '" is not supported yet, sorry';
            return console.error(message);
        }

        return stringify(this);
    }
};

module.exports = Node;
