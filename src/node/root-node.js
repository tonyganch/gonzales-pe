var Node = require('./basic-node');

class RootNode extends Node {
    buildIndex(ast, index, indexHasChanged) {
        if (!Array.isArray(ast.content)) return;

        for (var i = 0, l = ast.content.length; i < l; i++) {
            var node = ast.content[i];
            if (!index[node.type]) index[node.type] = [];
            node.indexHasChanged = indexHasChanged;
            index[node.type].push({
                node: node,
                parent: ast,
                i: i
            });

            this.buildIndex(node, index, indexHasChanged);
        }
    }

    traverseByType(type, callback) {
        if (!this.index) {
            this.index = {stylesheet: [this]};
            this.indexHasChanged = [0];
            this.buildIndex(this, this.index, this.indexHasChanged);
        }

        var nodes = this.index[type];
        var breakLoop;

        if (!nodes) return;

        for (var i = 0, l = nodes.length; i < l; i++) {
            if (this.indexHasChanged[0]) {
                this.index = {stylesheet: [this]};
                this.indexHasChanged = [0];
                this.buildIndex(this, this.index, this.indexHasChanged);
                nodes = this.index[type];
                i += nodes.length - l;
                l = nodes.length;
            }

            var node = nodes[i];
            breakLoop = callback(node.node, node.i, node.parent);
            if (breakLoop === null) break;
        }
    }

    traverseByTypes(types, callback) {
        for (var i = 0, l = types.length; i < l; i++) {
            this.traverseByType(types[i], callback);
        }
    }
};

module.exports = RootNode;
