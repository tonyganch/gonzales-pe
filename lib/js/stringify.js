module.exports = function stringify(tree) {
    // TODO: Better error message
    if (!tree) throw new Error('We need tree to translate');

    var hasInfo = typeof tree[0] === 'object';

    var _m_simple = {
            'ident': 1,
            'space': 1,
            'text': 1
        },
        _m_composite = {
            'program': 1
        },
        _m_primitive = {
        };

    function _t(tree) {
        var t = tree[hasInfo ? 1 : 0];
        if (t in _m_primitive) return _m_primitive[t];
        else if (t in _m_simple) return _simple(tree);
        else if (t in _m_composite) return _composite(tree);
        return _unique[t](tree);
    }

    function _composite(t, i) {
        var s = '';
        i = i === undefined ? (hasInfo ? 2 : 1) : i;
        for (; i < t.length; i++) s += typeof t[i] === 'string' ? t[i] : _t(t[i]);
        return s;
    }

    function _simple(t) {
        return t[hasInfo ? 2 : 1];
    }

    var _unique = {
        'functionBody': function(t) {
            return '{' + t[hasInfo ? 2 : 1] + '}';
        },
        'functionDeclaration': function(t) {
            return 'function' + _composite(t);
        },
        'params': function(t) {
            return '(' + t[hasInfo ? 2 : 1] + ')';
        }
    };

    return _t(tree);
};
