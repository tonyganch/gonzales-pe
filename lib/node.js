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
    }
};

module.exports = Node;
