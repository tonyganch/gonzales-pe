'use strict';

var ParsingError = require('./parsing-error');
var RootNode = require('./node/root-node');
var getSyntax = require('./get-syntax.node.js');

var Defaults = {
  SYNTAX: 'css',
  NEED_INFO: false,
  CSS_RULE: 'stylesheet',
  JS_RULE: 'program'
};


/**
 * @param {Object} gonzalesInstance
 * @param {String} css
 * @param {Object} options
 * @return {Object} AST
 */
function parser(gonzalesInstance, css, options) {
  if (typeof css !== 'string')
      throw new Error('Please, pass a string to parse');
  else if (!css)
      return require('./node/empty-node')();

  var syntax = options && options.syntax || Defaults.SYNTAX;
  var needInfo = options && options.needInfo || Defaults.NEED_INFO;
  var rule = options && options.rule ||
      (syntax === 'js' ? Defaults.JS_RULE : Defaults.CSS_RULE);

  var syntaxModule = gonzalesInstance.getSyntax(syntax);

  if (syntaxModule === null) {
    if (process.env.IS_WEBPACK === true) {
      let message = 'Syntax \'' + syntax + '\' is not loaded';
      return console.error(message);
    } else {
      try {
        syntaxModule = getSyntax(syntax, gonzalesInstance);
      } catch (e) {
        let message = 'Syntax \'' + syntax + '\' is not loaded';
        return console.error(message);
      }
    }
  }

  var getTokens = syntaxModule.tokenizer;
  var mark = syntaxModule.mark;
  var parse = syntaxModule.parse;

  var tokens = getTokens(css);
  mark(tokens);

  var ast;
  try {
    ast = parse(tokens, rule, needInfo);
  } catch (e) {
    if (!e.syntax) throw e;
    throw new ParsingError(e, css);
  }

  return new RootNode(ast);
}

module.exports = parser;
