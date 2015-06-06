/**
 * @param {string} type
 * @param {array|string} content
 * @param {number} line
 * @param {number} column
 * @constructor
 */
function Node(options) {
    this.type = options.type;
    this.content = options.content;
    this.syntax = options.syntax;

    if (options.start)
        this.start = {
            line: options.start[0],
            column: options.start[1]
        };

    if (options.end)
        this.end = {
            line: options.end[0],
            column: options.end[1]
        };
}

Node.prototype = {
    type: null,

    content: null,

    start: null,

    /**
     * @param {String} type Node type
     * @return {Boolean} Whether there is a child node of given type
     */
    contains: function(type) {
        return this.content.some(function(node) {
            return node.type === type;
        });
    },

    /**
     * @param {String} type Node type
     * @param {Function} callback Function to call for every found node
     */
    eachFor: function(type, callback) {
        if (!Array.isArray(this.content)) return;

        if (typeof type !== 'string') callback = type, type = null;

        var l = this.content.length;
        var i = l;
        var breakLoop;

        for (var i = l; i--;) {
            if (breakLoop === null) break;

            if (!type || this.content[i] && this.content[i].type === type)
                breakLoop = callback(this.content[i], i, this);
        }

        if (breakLoop === null) return null;
    },

    /**
     * @param {String} type
     * @return {Node} First child node
     */
    first: function(type) {
        if (!type || !Array.isArray(this.content)) return this.content[0];

        var i = 0;
        var l = this.content.length;

        for (; i < l; i++) {
            if (this.content[i].type === type) return this.content[i];
        }
    },

    /**
     * @param {String} type Node type
     * @param {Function} callback Function to call for every found node
     */
    forEach: function(type, callback) {
        if (!Array.isArray(this.content)) return;

        if (typeof type !== 'string') callback = type, type = null;

        var i = 0;
        var l = this.content.length;
        var breakLoop;

        for (; i < l; i++) {
            if (breakLoop === null) break;

            if (!type || this.content[i] && this.content[i].type === type)
                breakLoop = callback(this.content[i], i, this);
        }

        if (breakLoop === null) return null;
    },

    /**
     * @param {Number} index
     * @return {Node}
     */
    get: function(index) {
        return Array.isArray(this.content) && this.content[index];
    },

    /**
     * @param {Number} index
     * @param {Node} node
     */
    insert: function(index, node) {
        if (!Array.isArray(this.content)) return;

        this.content.splice(index, 0, node);
        this.indexHasChanged[0] = 1;
    },

    /**
     * @param {String} type
     * @return {Boolean} Whether the node is of given type
     */
    is: function(type) {
        return this.type === type;
    },

    /**
     * @param {String} type
     * @return {Node} Last child node
     */
    last: function(type) {
        var i = this.content.length - 1;

        if (!type || !Array.isArray(this.content))
            return this.content[i];


        for (;;i--) {
            if (this.content[i].type === type) return this.content[i];
        }
    },

    get length() {
        return this.content.length;
    },

    /**
     * @param {Number} index
     */
    remove: function(index) {
        if (!Array.isArray(this.content)) return;

        this.content.splice(index, 1);
        this.indexHasChanged[0] = 1;
    },

    toCSS: function() {
        try {
            stringify = require('./' + this.syntax + '/stringify');
        } catch (e) {
            var message = 'Syntax "' + this.syntax + '" is not supported yet, sorry';
            return console.error(message);
        }

        return stringify(this);
    },

    toString: function() {
        return JSON.stringify(this, false, 2);
    },

    /**
     * @param {Function} callback
     */
    traverse: function(callback, i, parent) {
        var breakLoop;
        var x;

        callback(this, i, parent);

        if (!Array.isArray(this.content)) return;

        for (var i = 0, l = this.content.length; i < l; i++) {
            breakLoop = this.content[i].traverse(callback, i, this);
            if (breakLoop === null) break;

            // If some nodes were removed or added:
            if (x = this.content.length - l) {
                l += x;
                i += x;
            }
        }

        if (breakLoop === null) return null;
    }
};

module.exports = Node;
