'use strict';

/**
 * @param {string} type
 * @param {array|string} content
 * @param {number} line
 * @param {number} column
 * @constructor
 */
class Node {
    constructor(options) {
      this.type = options.type;
      this.content = options.content;
      this.syntax = options.syntax;

      if (options.start) this.start = options.start;
      if (options.end) this.end = options.end;
    }

    /**
     * @param {String} type Node type
     * @return {Boolean} Whether there is a child node of given type
     */
    contains(type) {
      if (!Array.isArray(this.content)) {
        return false;
      }

      return this.content.some(function(node) {
        return node.type === type;
      });
    }

    /**
     * @param {String} type Node type
     * @param {Function} callback Function to call for every found node
     */
    eachFor(type, callback) {
      if (!Array.isArray(this.content)) return;

      if (typeof type !== 'string') {
        callback = type;
        type = null;
      }

      var l = this.content.length;
      var breakLoop;

      for (let i = l; i--;) {
        if (breakLoop === null) break;

        if (!type || this.content[i] && this.content[i].type === type)
            breakLoop = callback(this.content[i], i, this);
      }

      if (breakLoop === null) return null;
    }

    /**
     * @param {String} type
     * @return {?Node} First child node or `null` if nothing's been found.
     */
    first(type) {
      if (!Array.isArray(this.content)) return null;

      if (!type) return this.content[0];

      var i = 0;
      var l = this.content.length;

      for (; i < l; i++) {
        if (this.content[i].type === type) return this.content[i];
      }

      return null;
    }

    /**
     * @param {String} type Node type
     * @param {Function} callback Function to call for every found node
     */
    forEach(type, callback) {
      if (!Array.isArray(this.content)) return;

      if (typeof type !== 'string') {
        callback = type;
        type = null;
      }

      var i = 0;
      var l = this.content.length;
      var breakLoop;

      for (; i < l; i++) {
        if (breakLoop === null) break;

        if (!type || this.content[i] && this.content[i].type === type)
            breakLoop = callback(this.content[i], i, this);
      }

      if (breakLoop === null) return null;
    }

    /**
     * @param {Number} index
     * @return {?Node}
     */
    get(index) {
      if (!Array.isArray(this.content)) return null;

      let node = this.content[index];
      return node ? node : null;
    }

    /**
     * @param {Number} index
     * @param {Node} node
     */
    insert(index, node) {
      if (!Array.isArray(this.content)) return;

      this.content.splice(index, 0, node);
    }

    /**
     * @param {String} type
     * @return {Boolean} Whether the node is of given type
     */
    is(type) {
      return this.type === type;
    }

    /**
     * @param {String} type
     * @return {?Node} Last child node or `null` if nothing's been found.
     */
    last(type) {
      if (!Array.isArray(this.content)) return null;

      var i = this.content.length;
      if (!type) return this.content[i - 1];


      for (; i--;) {
        if (this.content[i].type === type) return this.content[i];
      }

      return null;
    }

    /**
     * Number of child nodes.
     * @type {number}
     */
    get length() {
      if (!Array.isArray(this.content)) return 0;
      return this.content.length;
    }

    /**
     * @param {Number} index
     * @return {Node}
     */
    removeChild(index) {
      if (!Array.isArray(this.content)) return;

      let removedChild = this.content.splice(index, 1);

      return removedChild;
    }

    toJson() {
      return JSON.stringify(this, false, 2);
    }

    toString() {
      let stringify;

      try {
        stringify = require('../' + this.syntax + '/stringify');
      } catch (e) {
        var message = `Syntax "${this.syntax}" is not supported yet, sorry`;
        return console.error(message);
      }

      return stringify(this);
    }

    /**
     * @param {Function} callback
     */
    traverse(callback, index, level = 0, parent = null) {
      var breakLoop;
      var x;

      level++;

      callback(this, index, parent, level);

      if (!Array.isArray(this.content)) return;

      for (let i = 0, l = this.content.length; i < l; i++) {
        breakLoop = this.content[i].traverse(callback, i, level, this);
        if (breakLoop === null) break;

        // If some nodes were removed or added:
        if (x = this.content.length - l) {
          l += x;
          i += x;
        }
      }

      if (breakLoop === null) return null;
    }

    traverseByType(type, callback) {
      this.traverse(function(node) {
        if (node.type === type) callback.apply(node, arguments);
      });
    }

    traverseByTypes(types, callback) {
      this.traverse(function(node) {
        if (types.indexOf(node.type) !== -1) callback.apply(node, arguments);
      });
    }

}

module.exports = Node;
