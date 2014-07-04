    return function(options) {
        var css, rule, syntax;

        if (!options) throw new Error('Please, pass a string to parse');

        css = typeof options === 'string'? options : options.css;
        if (!css) throw new Error('String can not be empty');

        rule = options.rule || 'stylesheet';

        syntax = options.syntax || 'css';
        if (!syntaxes[syntax]) throw new Error('Syntax "' + _syntax +
                                              '" is not currently supported, sorry');

        s = syntaxes[syntax];

        getTokens(css, syntax);
        tokensLength = tokens.length;

        pos = 0;

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
