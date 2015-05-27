var assert = require('assert');
var gonzales = require('../');
var NodeTypes = require('../lib/node-types');

describe('Empty input', function() {
    it('should return space type', function() {
        var ast = gonzales.parse('');
        assert.equal(ast.type, NodeTypes.SType);
    });

    it('should return empty content', function() {
        var ast = gonzales.parse('');
        assert.equal(ast.content, '');
    });
});