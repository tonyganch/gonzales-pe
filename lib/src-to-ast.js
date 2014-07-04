module.exports = (function() {
    return function(options) {
        var src, rule, syntax, getTokens, mark, rules, tokens;

        if (!options || !options.src) throw new Error('Please, pass a string to parse');

        src = typeof options === 'string' ? options : options.src;
        rule = options.rule || 'stylesheet';
        syntax = options.syntax || 'css';

        try {
            getTokens = require('./' + syntax + '/tokenizer');
            mark = require('./' + syntax + '/mark');
            rules = require('./' + syntax + '/rules');
        } catch (e) {
            return console.error('Syntax "' + syntax + '" is not supported yet, sorry');
        }

        tokens = getTokens(src);
        mark(tokens);
        return rules(tokens, rule);
    }
})();
