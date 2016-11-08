var assert = require('assert');
var gonzales = require('../');

var cssStringNonIndented = 'a{color:blue;}';
var cssStringTabIndented = 'a{\n\tcolor:blue;\n}';
var lessStringNonIndented = '@color:blue;a{color:@color;}';
var lessStringTabIndented = '@color:blue;\na{\n\tcolor:@color;\n}';
var sassStringTabIndented = '$color:blue\na\n\tcolor:$color';
var scssStringNonIndented = '$color:blue;a{color:$color;}';
var scssStringTabIndented = '$color:blue;\na{\n\tcolor:$color;\n}';

/**
 * Returns color declaration start column value.
 * @param {string} s String to be parsed
 * @param {Object} [options] Parsing options
 * @return {number} Start column value
 */
function getColorDeclarationStartCol(s, options) {
  var ast = gonzales.parse(s, options);
  return ast
    .first('ruleset')
    .first('block')
    .first('declaration')
    .start.column;
}

describe('tabSize', function() {
  describe('undefined', function() {
    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented);
      assert.equal(startCol, 2);
    });
  });

  describe('{}', function() {
    var options = {};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{tabSize:0}', function() {
    var options = {tabSize: 0};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{tabSize:1}', function() {
    var options = {tabSize: 1};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{tabSize:2}', function() {
    var options = {tabSize: 2};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 3 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 3);
    });
  });

  describe('{tabSize:4}', function() {
    var options = {tabSize: 4};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 5 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 5);
    });
  });

  describe('{syntax:\'css\'}', function() {
    var options = {syntax: 'css'};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'css\', tabSize:0}', function() {
    var options = {syntax: 'css', tabSize: 0};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'css\', tabSize:1}', function() {
    var options = {syntax: 'css', tabSize: 1};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'css\', tabSize:2}', function() {
    var options = {syntax: 'css', tabSize: 2};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 3 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 3);
    });
  });

  describe('{syntax:\'css\', tabSize:4}', function() {
    var options = {syntax: 'css', tabSize: 4};

    it('should return 3 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringNonIndented, options);
      assert.equal(startCol, 3);
    });

    it('should return 5 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(cssStringTabIndented, options);
      assert.equal(startCol, 5);
    });
  });

  describe('{syntax:\'less\'}', function() {
    var options = {syntax: 'less'};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'less\', tabSize:0}', function() {
    var options = {syntax: 'less', tabSize: 0};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'less\', tabSize:1}', function() {
    var options = {syntax: 'less', tabSize: 1};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'less\', tabSize:2}', function() {
    var options = {syntax: 'less', tabSize: 2};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 3 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringTabIndented, options);
      assert.equal(startCol, 3);
    });
  });

  describe('{syntax:\'less\', tabSize:4}', function() {
    var options = {syntax: 'less', tabSize: 4};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 5 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(lessStringTabIndented, options);
      assert.equal(startCol, 5);
    });
  });

  describe('{syntax:\'sass\'}', function() {
    var options = {syntax: 'sass'};

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(sassStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'sass\', tabSize:0}', function() {
    var options = {syntax: 'sass', tabSize: 0};

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(sassStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'sass\', tabSize:1}', function() {
    var options = {syntax: 'sass', tabSize: 1};

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(sassStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'sass\', tabSize:2}', function() {
    var options = {syntax: 'sass', tabSize: 2};


    it('should return 3 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(sassStringTabIndented, options);
      assert.equal(startCol, 3);
    });
  });

  describe('{syntax:\'sass\', tabSize:4}', function() {
    var options = {syntax: 'sass', tabSize: 4};

    it('should return 5 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(sassStringTabIndented, options);
      assert.equal(startCol, 5);
    });
  });

  describe('{syntax:\'scss\'}', function() {
    var options = {syntax: 'scss'};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'scss\', tabSize:0}', function() {
    var options = {syntax: 'scss', tabSize: 0};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'scss\', tabSize:1}', function() {
    var options = {syntax: 'scss', tabSize: 1};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 2 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringTabIndented, options);
      assert.equal(startCol, 2);
    });
  });

  describe('{syntax:\'scss\', tabSize:2}', function() {
    var options = {syntax: 'scss', tabSize: 2};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 3 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringTabIndented, options);
      assert.equal(startCol, 3);
    });
  });

  describe('{syntax:\'scss\', tabSize:4}', function() {
    var options = {syntax: 'scss', tabSize: 4};

    it('should return 15 for non-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringNonIndented, options);
      assert.equal(startCol, 15);
    });

    it('should return 5 for tab-indented declaration', function() {
      var startCol = getColorDeclarationStartCol(scssStringTabIndented, options);
      assert.equal(startCol, 5);
    });
  });
});
