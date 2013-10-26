    return function(options) {
        var css, rule;

        // TODO: Better error message
        if (!options) throw new Error('We need a string to parse');

        css = typeof options === 'string'? options : options.css;
        rule = options.rule || 'stylesheet';
        needInfo = options.needInfo || false;
        s = options.syntax && syntax[options.syntax] || syntax.css;

        pos = 0;
        tokens = getTokens(css, options.syntax);
        tokensLength = tokens.length;

        // Mark whitespaces and comments:
        s.markSC();

        // Validate and convert:
        return rules[rule]();
    }
}());
