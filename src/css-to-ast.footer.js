    return function(options) {
        var css, rule, syntax;
        pos = 0;

        if (!options) throw new Error('Please, pass a string to parse');

        css = typeof options === 'string'? options : options.css;
        if (!css) throw new Error('String can not be empty');

        rule = options.rule || 'stylesheet';
        needInfo = options.needInfo || false;

        syntax = options.syntax || 'css';
        if (!syntaxes[syntax]) throw new Error('Syntax "' + _syntax +
                                              '" is not currently supported, sorry');

        s = syntaxes[syntax];

        tokens = getTokens(css, syntax);
        tokensLength = tokens.length;

        // Mark paired brackets:
        s.markBrackets();

        // Mark whitespaces and comments:
        s.markSC();

        // Mark blocks:
        s.markBlocks && s.markBlocks();

        // Validate and convert:
        return rules[rule]();
    }
}());
