module.exports = function astToSrc(options) {
    var ast, syntax, stringify;

    // TODO(tonyganch): When ast can be a string?
    ast = typeof options === 'string' ? options : options.ast;
    syntax = options.syntax || 'css';

    try {
        stringify = require('./' + syntax + '/stringify');
    } catch (e) {
        return console.error('Syntax "' + syntax + '" is not supported yet, sorry');
    }

    return stringify(ast);
}
