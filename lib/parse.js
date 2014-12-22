var ParsingError = require('./parsing-error');

module.exports = (function() {
    return function(options) {
        var src, rule, syntax, getTokens, mark, parse, tokens, ast, needInfo;

        if (!options || !options.src) throw new Error('Please, pass a string to parse');

        src = typeof options === 'string' ? options : options.src;
        syntax = options.syntax || 'css';
        needInfo = options.needInfo || false;
        rule = options.rule || (syntax === 'js' ? 'program' : 'stylesheet');

        var fs = require('fs');
        if (!fs.existsSync(__dirname + '/' + syntax))
            return console.error('Syntax "' + syntax + '" is not supported yet, sorry');

        getTokens = require('./' + syntax + '/tokenizer');
        mark = require('./' + syntax + '/mark');
        parse = require('./' + syntax + '/parse');

        tokens = getTokens(src);
        mark(tokens);

        try {
            ast = parse(tokens, rule, needInfo);
        } catch (e) {
            throw new ParsingError(e, src);
        }

        return ast;
    }
})();
