var assert = require('assert');
var gonzales = require('../');
var Node = require('./../lib/node');

describe('Node#contains()', function() {
    it('should return true for existing child node', function() {
        var ast = gonzales.parse('a{}');
        assert.equal(ast.contains('ruleset'), true);
    });

    it('should return false for nonexisting child node', function() {
        var ast = gonzales.parse('a{}');
        assert.equal(ast.contains('nani'), false);
    });
});

describe('Node#find()', function() {
    it('should return the first child node of given type', function() {
        var ast = gonzales.parse('a{} b{}');
        var node = ast.find('ruleset')
        assert.equal(node.toCSS('css'), 'a{}')
    });
});
