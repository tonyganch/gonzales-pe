    return function(options) {
        var css, rule, _needInfo, _syntax;
        // TODO: Better error message
        if (!options) throw new Error('We need a string to parse');
        if (typeof options === 'string') css = options;
        else {
            css = options.css;
            rule = options.rule;
            _needInfo = options.needInfo;
            _syntax = options.syntax || 'css';
        }
        return getAST(_syntax, getTokens(css, _syntax), rule, _needInfo);
    }
}());
