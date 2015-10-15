'use strict';

var fs = require('fs');
var ParsingError = require('./parsing-error');

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

  var syntax = options && options.syntax || 'css';
  var context = options && options.context || 'stylesheet';

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
    ast = parse(tokens, context);
  } catch (e) {
    if (!e.syntax) throw e;
    throw new ParsingError(e, css);
  }

  return ast;
}

module.exports = parser;
