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
    this.start = {};
    //TODO
    if (typeof column !== 'undefined') {
        this.start.line = line;
        this.start.column = column;
    } else {
        this.start.line = line.ln;
        this.start.column = line.col;
    }
}

Node.prototype = {
    type: null,

    content: null,

    start: null
};

module.exports = Node;
