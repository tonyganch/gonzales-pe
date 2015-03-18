var fs = require('fs');
var ParsingError = require('./parsing-error');

var Defaults = {
    SYNTAX: 'css',
    NEED_INFO: false,
    CSS_RULE: 'stylesheet',
    JS_RULE: 'program',
    TAB_SIZE: 1
};

/**
 * Returns true if passed value is an integer, otherwise false.
 * This function is based off of MDN isInteger polyfill:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
 * @param {*} value Value to be verified
 * @return {boolean} True if passed value is an integer, otherwise false
 */
function isInteger(value) {
    return typeof value === 'number' && isFinite(value) &&  Math.floor(value) === value;
}

/**
 * @param {String} css
 * @param {Object} options
 * @return {Object} AST
 */
function parse(css, options) {
    if (!css || typeof css !== 'string')
        throw new Error('Please, pass a string to parse');

    var syntax = options && options.syntax || Defaults.SYNTAX;
    var needInfo = options && options.needInfo || Defaults.NEED_INFO;
    var rule = options && options.rule ||
        (syntax === 'js' ? Defaults.JS_RULE : Defaults.CSS_RULE);
    var tabSize = options && options.tabSize || Defaults.TAB_SIZE;
    if(!isInteger(tabSize) || tabSize < 1) {
        tabSize = Defaults.TAB_SIZE;
    }

    if (!fs.existsSync(__dirname + '/' + syntax))
        return console.error('Syntax "' + syntax + '" is not supported yet, sorry');

    var getTokens = require('./' + syntax + '/tokenizer');
    var mark = require('./' + syntax + '/mark');
    var parse = require('./' + syntax + '/parse');

    var tokens = getTokens(css, tabSize);
    mark(tokens);

    try {
        return parse(tokens, rule, needInfo);
    } catch (e) {
        throw new ParsingError(e, css);
    }
}

module.exports = parse;
