var assert = require('assert');
var gonzales = require('../../');

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

describe('Node#last()', function() {
  it('should return null if no node is found', function() {
      var ast = gonzales.parse('a{}');
      assert.equal(ast.last('declaration'), null);
  });

  it('should return the node if one is found', function() {
      var ast = gonzales.parse('a{}');
      assert.equal(ast.last('ruleset'), ast.content[0]);
  });
});
