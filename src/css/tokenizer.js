'use strict';

let Node = require('../node/basic-node');
let NodeType = require('../node/node-types');

let Space = {
  ' ': NodeType.SPACE,
  '\n': NodeType.SPACE,
  '\r': NodeType.SPACE,
  '\t': NodeType.SPACE
};

let Punctuation = {
  '!': NodeType.EXCLAMATION_MARK,
  '"': NodeType.QUOTATION_MARK,
  '#': NodeType.NUMBER_SIGN,
  '$': NodeType.DOLLAR_SIGN,
  '%': NodeType.PERCENT_SIGN,
  '&': NodeType.AMPERSAND,
  '\'': NodeType.APOSTROPHE,
  '(': NodeType.LEFT_PARENTHESIS,
  ')': NodeType.RIGHT_PARENTHESIS,
  '*': NodeType.ASTERISK,
  '+': NodeType.PLUS_SIGN,
  ',': NodeType.COMMA,
  '-': NodeType.HYPHEN_MINUS,
  '.': NodeType.FULL_STOP,
  '/': NodeType.SOLIDUS,
  ':': NodeType.COLON,
  ';': NodeType.SEMICOLON,
  '<': NodeType.LESS_THAN_SIGN,
  '=': NodeType.EQUALS_SIGN,
  '>': NodeType.GREATER_THAN_SIGN,
  '?': NodeType.QUESTION_MARK,
  '@': NodeType.COMMERCIAL_AT,
  '[': NodeType.LEFT_SQUARE_BRACKET,
  ']': NodeType.RIGHT_SQUARE_BRACKET,
  '^': NodeType.CIRCUMFLEX_ACCENT,
  '_': NodeType.LOW_LINE,
  '{': NodeType.LEFT_CURLY_BRACKET,
  '}': NodeType.RIGHT_CURLY_BRACKET,
  '|': NodeType.VERTICAL_LINE,
  '~': NodeType.TILDE
};

let tokens = [];
let urlMode = false;
let blockMode = 0;
let pos = 0;
let tn = 0;
let ln = 1;
let col = 1;
let cssLength = 0;
let syntax = 'css';

function addNode(type, value, column, line = ln) {
  let node = new Node({
    type: type,
    content: value,
    syntax: syntax,
    start: {
      line: line,
      column: column
    },
    // TODO: Calculate real end position.
    end: {
      line: ln,
      column: col
    }
  });

  tokens.push(node);
}

function isDecimalDigit(c) {
  return '0123456789'.indexOf(c) >= 0;
}

function buildPrimitiveNodes(css, tabSize) {
  tokens = [];
  urlMode = false;
  blockMode = 0;
  pos = 0;
  tn = 0;
  ln = 1;
  col = 1;
  cssLength = 0;

  /**
   * Parse spaces
   * @param {string} css Unparsed part of CSS string
   */
  function parseSpaces(css) {
    var start = pos;
    var startCol = col;
    var startLn = ln;

    // Read the string until we meet a non-space character:
    for (; pos < cssLength; pos++) {
      let char = css.charAt(pos);
      if (!Space[char]) break;
      if (char === '\n' || char === '\r') {
        ln++;
        col = 0;
      }
    }

    // Add a substring containing only spaces to tokens:
    addNode(NodeType.SPACE, css.substring(start, pos--), startCol, startLn);
    col += (pos - start);
  }

  /**
   * Parse a string within quotes
   * @param {string} css Unparsed part of CSS string
   * @param {string} q Quote (either `'` or `"`)
   */
  function parseString(css, q) {
    var start = pos;

    // Read the string until we meet a matching quote:
    for (pos++; pos < cssLength; pos++) {
      // Skip escaped quotes:
      if (css.charAt(pos) === '\\') pos++;
      else if (css.charAt(pos) === q) break;
    }

    // Add the string (including quotes) to tokens:
    addNode(NodeType.STRING, css.substring(start, pos + 1), col);
    col += (pos - start);
  }

  /**
   * Parse numbers
   * @param {string} css Unparsed part of CSS string
   */
  function parseDecimalNumber(css) {
    var start = pos;

    for (; pos < css.length; pos++) {
      if (!isDecimalDigit(css.charAt(pos))) break;
    }

    // Add the number to tokens:
    addNode(NodeType.DIGIT, css.substring(start, pos--), col);
    col++;
  }

  /**
   * Parse identifier
   * @param {string} css Unparsed part of CSS string
   */
  function parseIdentifier(css) {
    var start = pos;

    // Skip all opening slashes:
    while (css.charAt(pos) === '/') pos++;

    // Read the string until we meet a punctuation mark:
    for (; pos < cssLength; pos++) {
      let char = css.charAt(pos);
      // Skip all '\':
      if (char === '\\') pos++;
      else if (Punctuation[char] ||
          Space[char]) break;
    }

    var ident = css.substring(start, pos--);

    // Enter url mode if parsed substring is `url`:
    if (!urlMode && ident === 'url' && css.charAt(pos + 1) === '(') {
      urlMode = true;
    }

    // Add identifier to tokens:
    addNode(NodeType.CHARACTER, ident, col);
    col += (pos - start);
  }

  /**
  * Parse a multiline comment
  * @param {string} css Unparsed part of CSS string
  */
  function parseMLComment(css) {
    var start = pos;

    // Read the string until we meet `*/`.
    // Since we already know first 2 characters (`/*`), start reading
    // from `pos + 2`:
    for (pos = pos + 2; pos < cssLength; pos++) {
      if (css.charAt(pos) === '*' && css.charAt(pos + 1) === '/') {
        pos++;
        break;
      }
    }

    // Add full comment (including `/*` and `*/`) to the list of tokens:
    var comment = css.substring(start, pos + 1);
    addNode(NodeType.MULTILINE_COMMENT, comment, col);

    var newlines = comment.split('\n');
    if (newlines.length > 1) {
      ln += newlines.length - 1;
      col = newlines[newlines.length - 1].length;
    } else {
      col += (pos - start);
    }
  }

  function parseSLComment(css) {
    var start = pos;

    // Read the string until we meet line break.
    // Since we already know first 2 characters (`//`), start reading
    // from `pos + 2`:
    for (pos += 2; pos < cssLength; pos++) {
      if (css.charAt(pos) === '\n' || css.charAt(pos) === '\r') {
        break;
      }
    }

    // Add comment (including `//` and line break) to the list of tokens:
    addNode(NodeType.SINGLELINE_COMMENT, css.substring(start, pos--), col);
    col += pos - start;
  }

  /**
   * Convert a CSS string to a list of tokens
   * @param {string} css CSS string
   * @returns {Array} List of tokens
   * @private
   */
  function getTokens(css) {
    var c; // Current character
    var cn; // Next character

    cssLength = css.length;

    // Parse string, character by character:
    for (pos = 0; pos < cssLength; col++, pos++) {
      c = css.charAt(pos);
      cn = css.charAt(pos + 1);

      // If we meet `/*`, it's a start of a multiline comment.
      // Parse following characters as a multiline comment:
      if (c === '/' && cn === '*') {
        parseMLComment(css);
      }

      // If we meet `//` and it is not a part of url:
      else if (!urlMode && c === '/' && cn === '/') {
        // If we're currently inside a block, treat `//` as a start
        // of identifier. Else treat `//` as a start of a single-line
        // comment:
        if (blockMode > 0) parseIdentifier(css);
        else parseSLComment(css);
      }

      // If current character is a double or single quote, it's a start
      // of a string:
      else if (c === '"' || c === "'") {
        parseString(css, c);
      }

      // If current character is a space:
      else if (Space[c]) {
        parseSpaces(css);
      }

      // If current character is a punctuation mark:
      else if (Punctuation[c]) {
        // Add it to the list of tokens:
        addNode(Punctuation[c], c, col);
        if (c === ')') urlMode = false; // Exit url mode
        else if (c === '{') blockMode++; // Enter a block
        else if (c === '}') blockMode--; // Exit a block
        else if (c === '\t' && tabSize > 1) col += (tabSize - 1);
      }

      // If current character is a decimal digit:
      else if (isDecimalDigit(c)) {
        parseDecimalNumber(css);
      }

      // If current character is anything else:
      else {
        parseIdentifier(css);
      }
    }

    return tokens;
  }

  return getTokens(css);
}

module.exports = buildPrimitiveNodes;
