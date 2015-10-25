'use strict';

var NodeType = require('../node/node-types');

module.exports = (function() {
  /**
  * Mark whitespaces and comments
  */
  function markSC(tokens) {
    let tokensLength = tokens.length;
    let ws = -1; // Flag for whitespaces
    let sc = -1; // Flag for whitespaces and comments
    let t; // Current token

    // For every token in the token list, mark spaces and line breaks
    // as spaces (set both `ws` and `sc` flags). Mark multiline comments
    // with `sc` flag.
    // If there are several spaces or tabs or line breaks or multiline
    // comments in a row, group them: take the last one's index number
    // and save it to the first token in the group as a reference:
    // e.g., `ws_last = 7` for a group of whitespaces or `sc_last = 9`
    // for a group of whitespaces and comments.
    for (var i = 0; i < tokensLength; i++) {
      t = tokens[i];
      switch (t.type) {
        case NodeType.SPACE:
        case NodeType.NEWLINE:
          t.ws = true;
          t.sc = true;

          if (ws === -1) ws = i;
          if (sc === -1) sc = i;

          break;
        case NodeType.MULTILINE_COMMENT:
        case NodeType.SINGLELINE_COMMENT:
          if (ws !== -1) {
            tokens[ws].ws_last = i - 1;
            ws = -1;
          }

          t.sc = true;

          break;
        default:
          if (ws !== -1) {
            tokens[ws].ws_last = i - 1;
            ws = -1;
          }

          if (sc !== -1) {
            tokens[sc].sc_last = i - 1;
            sc = -1;
          }
      }
    }

    if (ws !== -1) tokens[ws].ws_last = i - 1;
    if (sc !== -1) tokens[sc].sc_last = i - 1;
  }

  /**
  * Pair brackets
  */
  function markBrackets(tokens) {
    let tokensLength = tokens.length;
    let ps = []; // Parentheses
    let sbs = []; // Square brackets
    let cbs = []; // Curly brackets
    let t; // Current token

    // For every token in the token list, if we meet an opening (left)
    // bracket, push its index number to a corresponding array.
    // If we then meet a closing (right) bracket, look at the corresponding
    // array. If there are any elements (records about previously met
    // left brackets), take a token of the last left bracket (take
    // the last index number from the array and find a token with
    // this index number) and save right bracket's index as a reference:
    for (var i = 0; i < tokensLength; i++) {
      t = tokens[i];
      switch (t.type) {
        case NodeType.LEFT_PARENTHESIS:
          ps.push(i);
          break;
        case NodeType.RIGHT_PARENTHESIS:
          if (ps.length) {
            t.left = ps.pop();
            tokens[t.left].right = i;
          }
          break;
        case NodeType.LEFT_SQUARE_BRACKET:
          sbs.push(i);
          break;
        case NodeType.RIGHT_SQUARE_BRACKET:
          if (sbs.length) {
            t.left = sbs.pop();
            tokens[t.left].right = i;
          }
          break;
        case NodeType.LEFT_CURLY_BRACKET:
          cbs.push(i);
          break;
        case NodeType.RIGHT_CURLY_BRACKET:
          if (cbs.length) {
            t.left = cbs.pop();
            tokens[t.left].right = i;
          }
          break;
      }
    }
  }

  return function(tokens) {
    markBrackets(tokens);
    markSC(tokens);
  };
})();
