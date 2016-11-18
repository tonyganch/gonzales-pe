'use strict';

var TokenType = require('../token-types');

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
        case TokenType.Space:
        case TokenType.Tab:
          t.ws = true;
          t.sc = true;

          if (ws === -1) ws = i;
          if (sc === -1) sc = i;

          break;
        case TokenType.Newline:
          t.ws = true;
          t.sc = true;

          ws = ws === -1 ? i : ws;
          sc = sc === -1 ? i : ws;

          tokens[ws].ws_last = i - 1;
          tokens[sc].sc_last = i - 1;
          tokens[i].ws_last = i;
          tokens[i].sc_last = i;

          ws = -1;
          sc = -1;

          break;
        case TokenType.CommentML:
        case TokenType.CommentSL:
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
        case TokenType.LeftParenthesis:
          ps.push(i);
          break;
        case TokenType.RightParenthesis:
          if (ps.length) {
            t.left = ps.pop();
            tokens[t.left].right = i;
          }
          break;
        case TokenType.LeftSquareBracket:
          sbs.push(i);
          break;
        case TokenType.RightSquareBracket:
          if (sbs.length) {
            t.left = sbs.pop();
            tokens[t.left].right = i;
          }
          break;
        case TokenType.LeftCurlyBracket:
          cbs.push(i);
          break;
        case TokenType.RightCurlyBracket:
          if (cbs.length) {
            t.left = cbs.pop();
            tokens[t.left].right = i;
          }
          break;
      }
    }
  }

  function markBlocks(tokens) {
    let i = 0;
    let l = tokens.length;
    let lines = [];
    let whitespaceOnlyLines = [];

    for (i = 0; i < l; i++) {
      let lineStart = i;
      let currentLineIndent = 0;

      // Get all spaces.
      while (i < l && (tokens[i].type === TokenType.Space ||
          tokens[i].type === TokenType.Tab)) {
        currentLineIndent += tokens[i].value.length;
        i++;
      }

      lines.push([lineStart, currentLineIndent]);

      let x = i;
      while (i < l && tokens[i].type !== TokenType.Newline) {
        i++;
      }

      if (x === i) {
        whitespaceOnlyLines.push(lines.length - 1);
      }
    }

    let levels = [0];
    let blockStarts = [];

    for (i = 0; i < lines.length; i++) {
      let line = lines[i];
      let token = line[0];
      let indent = line[1];
      let lastLevel = levels[levels.length - 1];

      if (indent > lastLevel) {
        blockStarts.push(token);
        levels.push(indent);
      } else {
        // Check if line is whitespace-only.
        let p = i;

        while (true) {
          if (whitespaceOnlyLines.indexOf(p) === -1) break;
          p++;
        }

        if (i === p && indent === lastLevel) continue;

        if (!lines[p]) {
          continue;
        }

        indent = lines[p][1];

        if (indent === lastLevel) {
          i = p;
          continue;
        }

        if (indent > lastLevel) {
          blockStarts.push(token);
          levels.push(lines[p][1]);
          i = p;
          continue;
        }

        while (true) {
          let lastLevel = levels.pop();
          if (indent < lastLevel) {
            let start = blockStarts.pop();
            tokens[start].block_end = token - 1;
          } else {
            levels.push(indent);
            break;
          }
        }
      }
    }

    blockStarts.forEach(start => {
      tokens[start].block_end = tokens.length - 1;
    });
  }

  return function(tokens) {
    markBrackets(tokens);
    markSC(tokens);
    markBlocks(tokens);
  };
})();
