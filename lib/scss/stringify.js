module.exports = function stringify(tree) {
    // TODO: Better error message
    if (!tree) throw new Error('We need tree to translate');

    var simple = ['attrselector', 'combinator', 'nth', 'number',
            'operator', 'raw', 's', 'string', 'unary'];
    var composite = ['atruleb', 'atrulerq', 'atrulers', 'atrules', 'condition',
            'conditionalStatement',
            'declaration', 'dimension', 'filterv', 'function',
            'ident', 'include',
            'loop', 'mixin', 'selector', 'progid', 'property',
            'ruleset', 'simpleselector', 'stylesheet', 'value'];

    function _t(tree) {
        var type = tree.type;
        if (simple.indexOf(type) !== -1) return tree.content;
        if (composite.indexOf(type) !== -1) return _composite(tree.content);
        return _unique[type](tree);
    }

    function _composite(t, i) {
        if (!t) return '';

        var s = '';
        i = i || 0;
        for (; i < t.length; i++) s += _t(t[i]);
        return s;
    }

    var _unique = {
        'arguments': function(t) {
            return '(' + _composite(t.content) + ')';
        },
        'atkeyword': function(t) {
            return '@' + _composite(t.content);
        },
        'atruler': function(t) {
            return _t(t.content[0]) + _t(t.content[1]) + '{' + _t(t.content[2]) + '}';
        },
        'attrib': function(t) {
            return '[' + _composite(t.content) + ']';
        },
        'block': function(t) {
            return '{' + _composite(t.content) + '}';
        },
        'braces': function(t) {
            return t.content[0] + _composite(t.content.slice(2)) + t.content[1];
        },
        'class': function(t) {
            return '.' + _composite(t.content);
        },
        'commentML': function (t) {
            return '/*' + t.content + '*/';
        },
        'commentSL': function (t) {
            return '/' + '/' + t.content;
        },
        'declDelim': function() {
            return ';';
        },
        'default': function(t) {
            return '!' + _composite(t.content) + 'default';
        },
        'delim': function() {
            return ',';
        },
        'filter': function(t) {
            return _t(t.content[0]) + ':' + _t(t.content[1]);
        },
        'functionExpression': function(t) {
            return 'expression(' + t.content + ')';
        },
        'important': function(t) {
            return '!' + _composite(t.content) + 'important';
        },
        'interpolation': function(t) {
            return '#{' + _composite(t.content) + '}';
        },
        'namespace': function() {
            return '|';
        },
        'nthselector': function(t) {
            return ':' + _t(t.content[0]) + '(' + _composite(t.content.slice(1)) + ')';
        },
        'parentselector': function() {
            return '&';
        },
        'percentage': function(t) {
            return _composite(t.content) + '%';
        },
        'placeholder': function(t) {
            return '%' + _composite(t.content);
        },
        'propertyDelim': function() {
            return ':';
        },
        'pseudoc': function(t) {
            return ':' + _composite(t.content);
        },
        'pseudoe': function(t) {
            return '::' + _composite(t.content);
        },
        'shash': function (t) {
            return '#' + t.content;
        },
        'uri': function(t) {
            return 'url(' + _composite(t.content) + ')';
        },
        'variable': function(t) {
            return '$' + _composite(t.content);
        },
        'variableslist': function(t) {
            return _composite(t.content) + '...';
        },
        'vhash': function(t) {
            return '#' + t.content;
        }
    };

    return _t(tree);
}
