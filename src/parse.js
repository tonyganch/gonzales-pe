'use strict';

var fs = require('fs');
var ParsingError = require('./parsing-error');

var Defaults = {
  SYNTAX: 'css',
  NEED_INFO: false,
  CSS_RULE: 'stylesheet'
};

/**
 * @param {String} css
 * @param {Object} options
 * @return {Object} AST
 */
function parser(css, options) {
  if (typeof css !== 'string')
      throw new Error('Please, pass a string to parse');
  else if (!css)
      return require('./node/empty-node')();

  var syntax = options && options.syntax || Defaults.SYNTAX;
  var needInfo = options && options.needInfo || Defaults.NEED_INFO;
  var rule = options && options.rule || Defaults.CSS_RULE;

  if (!fs.existsSync(__dirname + '/' + syntax)) {
    let message = 'Syntax "' + syntax + '" is not supported yet, sorry';
    return console.error(message);
  }

  var getTokens = require('./' + syntax + '/tokenizer');
  var mark = require('./' + syntax + '/mark');
  var parse = require('./' + syntax + '/parse');

  var tokens = getTokens(css);
  mark(tokens);

  var ast;
  try {
    ast = parse(tokens, rule, needInfo);
  } catch (e) {
    if (!e.syntax) throw e;
    throw new ParsingError(e, css);
  }

  return ast;
}

module.exports = parser;
