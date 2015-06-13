var assert = require('assert');
var gonzales = require('../../');
var NodeTypes = require('../../lib/node/node-types');

describe('Empty input', function() {
    it('should return stylesheet type', function() {
        var ast = gonzales.parse('');
        assert.equal(ast.type, NodeTypes.StylesheetType);
    });

    it('should return empty content', function() {
        var ast = gonzales.parse('');
        assert.equal(ast.content.length, 0);
    });
});
