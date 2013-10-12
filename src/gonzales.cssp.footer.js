    return function(options) {
        var _syntax, src, rule, _needInfo;
        // TODO: Better error message
        if (!options) throw new Error('We need a string to parse');
        if (typeof options === 'string') s = options;
        else {
            src = options.src;
            rule = options.rule;
            _needInfo = options.info;
            _syntax = options.syntax || 'css';
        }
        return getCSSPAST(_syntax, getTokens(src), rule, _needInfo);
    }
}());
