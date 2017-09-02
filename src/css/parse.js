'use strict';

const Node = require('../node/basic-node');
const NodeType = require('../node/node-types');
const TokenType = require('../token-types');

/**
 * @type {Array}
 */
let tokens;

/**
 * @type {Number}
 */
let tokensLength;

/**
 * @type {Number}
 */
let pos;

const contexts = {
  'atkeyword': () => {
    return checkAtkeyword(pos) && getAtkeyword();
  },
  'atrule': () => {
    return checkAtrule(pos) && getAtrule();
  },
  'attributeSelector': () => {
    return checkAttributeSelector(pos) && getAttributeSelector();
  },
  'block': () => {
    return checkBlock(pos) && getBlock();
  },
  'brackets': () => {
    return checkBrackets(pos) && getBrackets();
  },
  'class': () => {
    return checkClass(pos) && getClass();
  },
  'combinator': () => {
    return checkCombinator(pos) && getCombinator();
  },
  'commentML': () => {
    return checkCommentML(pos) && getCommentML();
  },
  'declaration': () => {
    return checkDeclaration(pos) && getDeclaration();
  },
  'declDelim': () => {
    return checkDeclDelim(pos) && getDeclDelim();
  },
  'delim': () => {
    return checkDelim(pos) && getDelim();
  },
  'dimension': () => {
    return checkDimension(pos) && getDimension();
  },
  'expression': () => {
    return checkExpression(pos) && getExpression();
  },
  'function': () => {
    return checkFunction(pos) && getFunction();
  },
  'ident': () => {
    return checkIdent(pos) && getIdent();
  },
  'important': () => {
    return checkImportant(pos) && getImportant();
  },
  'namespace': () => {
    return checkNamespace(pos) && getNamespace();
  },
  'number': () => {
    return checkNumber(pos) && getNumber();
  },
  'operator': () => {
    return checkOperator(pos) && getOperator();
  },
  'parentheses': () => {
    return checkParentheses(pos) && getParentheses();
  },
  'percentage': () => {
    return checkPercentage(pos) && getPercentage();
  },
  'progid': () => {
    return checkProgid(pos) && getProgid();
  },
  'property': () => {
    return checkProperty(pos) && getProperty();
  },
  'propertyDelim': () => {
    return checkPropertyDelim(pos) && getPropertyDelim();
  },
  'pseudoc': () => {
    return checkPseudoc(pos) && getPseudoc();
  },
  'pseudoe': () => {
    return checkPseudoe(pos) && getPseudoe();
  },
  'ruleset': () => {
    return checkRuleset(pos) && getRuleset();
  },
  's': () => {
    return checkS(pos) && getS();
  },
  'selector': () => {
    return checkSelector(pos) && getSelector();
  },
  'shash': () => {
    return checkShash(pos) && getShash();
  },
  'string': () => {
    return checkString(pos) && getString();
  },
  'stylesheet': () => {
    return checkStylesheet(pos) && getStylesheet();
  },
  'unary': () => {
    return checkUnary(pos) && getUnary();
  },
  'unicodeRange': () => {
    return checkUnicodeRange(pos) && getUnicodeRange();
  },
  'universalSelector': () => {
    return checkUniversalSelector(pos) && getUniversalSelector();
  },
  'urange': () => {
    return checkUrange(pos) && getUrange();
  },
  'uri': () => {
    return checkUri(pos) && getUri();
  },
  'value': () => {
    return checkValue(pos) && getValue();
  },
  'vhash': () => {
    return checkVhash(pos) && getVhash();
  }
};

/**
 * Stop parsing and display error
 * @param {Number=} i Token's index number
 */
function throwError(i) {
  const ln = tokens[i].ln;

  throw {line: ln, syntax: 'css'};
}

/**
 * @param {Object} exclude
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkExcluding(exclude, i) {
  const start = i;

  while (i < tokensLength) {
    if (exclude[tokens[i++].type]) break;
  }

  return i - start - 2;
}

/**
 * @param {Number} start
 * @param {Number} finish
 * @return {String}
 */
function joinValues(start, finish) {
  let s = '';

  for (let i = start; i < finish + 1; i++) {
    s += tokens[i].value;
  }

  return s;
}

/**
 * @param {Number} start
 * @param {Number} num
 * @return {String}
 */
function joinValues2(start, num) {
  if (start + num - 1 >= tokensLength) return;

  let s = '';

  for (let i = 0; i < num; i++) {
    s += tokens[start + i].value;
  }

  return s;
}

function getLastPosition(content, line, column, colOffset) {
  return typeof content === 'string' ?
      getLastPositionForString(content, line, column, colOffset) :
      getLastPositionForArray(content, line, column, colOffset);
}

function getLastPositionForString(content, line, column, colOffset) {
  let position = [];

  if (!content) {
    position = [line, column];
    if (colOffset) position[1] += colOffset - 1;
    return position;
  }

  const lastLinebreak = content.lastIndexOf('\n');
  const endsWithLinebreak = lastLinebreak === content.length - 1;
  const splitContent = content.split('\n');
  const linebreaksCount = splitContent.length - 1;
  const prevLinebreak = linebreaksCount === 0 || linebreaksCount === 1 ?
      -1 : content.length - splitContent[linebreaksCount - 1].length - 2;

  // Line:
  let offset = endsWithLinebreak ? linebreaksCount - 1 : linebreaksCount;
  position[0] = line + offset;

  // Column:
  if (endsWithLinebreak) {
    offset = prevLinebreak !== -1 ?
        content.length - prevLinebreak :
        content.length - 1;
  } else {
    offset = linebreaksCount !== 0 ?
        content.length - lastLinebreak - column - 1 :
        content.length - 1;
  }
  position[1] = column + offset;

  if (!colOffset) return position;

  if (endsWithLinebreak) {
    position[0]++;
    position[1] = colOffset;
  } else {
    position[1] += colOffset;
  }

  return position;
}

function getLastPositionForArray(content, line, column, colOffset) {
  let position;

  if (content.length === 0) {
    position = [line, column];
  } else {
    const c = content[content.length - 1];
    if (c.hasOwnProperty('end')) {
      position = [c.end.line, c.end.column];
    } else {
      position = getLastPosition(c.content, line, column);
    }
  }

  if (!colOffset) return position;

  if (tokens[pos - 1] && tokens[pos - 1].type !== 'Newline') {
    position[1] += colOffset;
  } else {
    position[0]++;
    position[1] = 1;
  }

  return position;
}

function newNode(type, content, line, column, end) {
  if (!end) end = getLastPosition(content, line, column);
  return new Node({
    type: type,
    content: content,
    start: {
      line: line,
      column: column
    },
    end: {
      line: end[0],
      column: end[1]
    },
    syntax: 'css'
  });
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkAny(i) {
  let l;

  if (l = checkBrackets(i)) tokens[i].any_child = 1;
  else if (l = checkParentheses(i)) tokens[i].any_child = 2;
  else if (l = checkString(i)) tokens[i].any_child = 3;
  else if (l = checkPercentage(i)) tokens[i].any_child = 4;
  else if (l = checkDimension(i)) tokens[i].any_child = 5;
  else if (l = checkUnicodeRange(i)) tokens[i].any_child = 13;
  else if (l = checkNumber(i)) tokens[i].any_child = 6;
  else if (l = checkUri(i)) tokens[i].any_child = 7;
  else if (l = checkExpression(i)) tokens[i].any_child = 8;
  else if (l = checkFunction(i)) tokens[i].any_child = 9;
  else if (l = checkIdent(i)) tokens[i].any_child = 10;
  else if (l = checkClass(i)) tokens[i].any_child = 11;
  else if (l = checkUnary(i)) tokens[i].any_child = 12;

  return l;
}

/**
 * @return {Node}
 */
function getAny() {
  const childType = tokens[pos].any_child;

  if (childType === 1) return getBrackets();
  if (childType === 2) return getParentheses();
  if (childType === 3) return getString();
  if (childType === 4) return getPercentage();
  if (childType === 5) return getDimension();
  if (childType === 13) return getUnicodeRange();
  if (childType === 6) return getNumber();
  if (childType === 7) return getUri();
  if (childType === 8) return getExpression();
  if (childType === 9) return getFunction();
  if (childType === 10) return getIdent();
  if (childType === 11) return getClass();
  if (childType === 12) return getUnary();
}


/**
 * @return {Node}
 */
function getArguments() {
  const type = NodeType.ArgumentsType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];
  let body;

  // Skip `(`.
  pos++;

  while (pos < tokensLength &&
      tokens[pos].type !== TokenType.RightParenthesis) {
    if (checkDeclaration(pos)) content.push(getDeclaration());
    else if (checkArgument(pos)) {
      body = getArgument();
      if (typeof body.content === 'string') content.push(body);
      else content = content.concat(body);
    } else if (checkClass(pos)) content.push(getClass());
    else throwError(pos);
  }

  const end = getLastPosition(content, line, column, 1);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkArgument(i) {
  let l;

  if (l = checkVhash(i)) tokens[i].argument_child = 1;
  else if (l = checkCustomProperty(i)) tokens[i].argument_child = 2;
  else if (l = checkAny(i)) tokens[i].argument_child = 3;
  else if (l = checkSC(i)) tokens[i].argument_child = 4;
  else if (l = checkOperator(i)) tokens[i].argument_child = 5;

  return l;
}

/**
 * @return {Node}
 */
function getArgument() {
  const childType = tokens[pos].argument_child;

  if (childType === 1) return getVhash();
  if (childType === 2) return getCustomProperty();
  if (childType === 3) return getAny();
  if (childType === 4) return getSC();
  if (childType === 5) return getOperator();
}

/**
 * Check if token is part of an @-word (e.g. `@import`, `@include`)
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkAtkeyword(i) {
  let l;

  // Check that token is `@`:
  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.CommercialAt) return 0;

  return (l = checkIdent(i)) ? l + 1 : 0;
}

/**
 * Get node with @-word
 * @return {Node}
 */
function getAtkeyword() {
  const type = NodeType.AtkeywordType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `@`.
  pos++;

  const content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * Check if token is a part of an @-rule
 * @param {Number} i Token's index number
 * @return {Number} Length of @-rule
 */
function checkAtrule(i) {
  let l;

  if (i >= tokensLength) return 0;

  // If token already has a record of being part of an @-rule,
  // return the @-rule's length:
  if (tokens[i].atrule_l !== undefined) return tokens[i].atrule_l;

  // If token is part of an @-rule, save the rule's type to token.
  // @keyframes:
  if (l = checkKeyframesRule(i)) tokens[i].atrule_type = 4;
  // @-rule with ruleset:
  else if (l = checkAtruler(i)) tokens[i].atrule_type = 1;
  // Block @-rule:
  else if (l = checkAtruleb(i)) tokens[i].atrule_type = 2;
  // Single-line @-rule:
  else if (l = checkAtrules(i)) tokens[i].atrule_type = 3;
  else return 0;

  // If token is part of an @-rule, save the rule's length to token:
  tokens[i].atrule_l = l;

  return l;
}

/**
 * Get node with @-rule
 * @return {Node}
 */
function getAtrule() {
  const childType = tokens[pos].atrule_type;

  if (childType === 1) return getAtruler(); // @-rule with ruleset
  if (childType === 2) return getAtruleb(); // Block @-rule
  if (childType === 3) return getAtrules(); // Single-line @-rule
  if (childType === 4) return getKeyframesRule();
}

/**
 * Check if token is part of a block @-rule
 * @param {Number} i Token's index number
 * @return {Number} Length of the @-rule
 */
function checkAtruleb(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (l = checkTsets(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a block @-rule
 * @return {Node}
 */
function getAtruleb() {
  const type = NodeType.AtruleType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getAtkeyword(),
    getTsets(),
    getBlock()
  );

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of an @-rule with ruleset
 * @param {Number} i Token's index number
 * @return {Number} Length of the @-rule
 */
function checkAtruler(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (l = checkTsets(i)) i += l;

  if (i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket) i++;
  else return 0;

  if (l = checkAtrulers(i)) i += l;

  if (i < tokensLength && tokens[i].type === TokenType.RightCurlyBracket) i++;
  else return 0;

  return i - start;
}

/**
 * Get node with an @-rule with ruleset
 * @return {Node}
 */
function getAtruler() {
  const type = NodeType.AtruleType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getAtkeyword(),
    getTsets(),
    getAtrulers()
  );

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkAtrulers(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkSC(i)) i += l;

  while (i < tokensLength) {
    if (l = checkSC(i)) tokens[i].atrulers_child = 1;
    else if (l = checkAtrule(i)) tokens[i].atrulers_child = 2;
    else if (l = checkRuleset(i)) tokens[i].atrulers_child = 3;
    else break;
    i += l;
  }

  if (i < tokensLength) tokens[i].atrulers_end = 1;

  if (l = checkSC(i)) i += l;

  return i - start;
}

/**
 * @return {Node}
 */
function getAtrulers() {
  const type = NodeType.BlockType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  // Skip `{`.
  pos++;

  content = content.concat(getSC());

  while (pos < tokensLength && !tokens[pos].atrulers_end) {
    const childType = tokens[pos].atrulers_child;
    if (childType === 1) content = content.concat(getSC());
    else if (childType === 2) content.push(getAtrule());
    else if (childType === 3) content.push(getRuleset());
    else break;
  }

  content = content.concat(getSC());

  const end = getLastPosition(content, line, column, 1);

  // Skip `}`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkAtrules(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (l = checkTsets(i)) i += l;

  return i - start;
}

/**
 * @return {Node}
 */
function getAtrules() {
  const type = NodeType.AtruleType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getAtkeyword(),
    getTsets()
  );

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a block (e.g. `{...}`).
 * @param {Number} i Token's index number
 * @return {Number} Length of the block
 */
function checkBlock(i) {
  return i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket ?
      tokens[i].right - i + 1 : 0;
}

/**
 * Get node with a block
 * @return {Node}
 */
function getBlock() {
  const type = NodeType.BlockType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const end = tokens[pos].right;
  let content = [];

  // Skip `{`.
  pos++;

  while (pos < end) {
    if (checkBlockdecl(pos)) content = content.concat(getBlockdecl());
    else throwError(pos);
  }

  const end_ = getLastPosition(content, line, column, 1);
  pos = end + 1;

  return newNode(type, content, line, column, end_);
}

/**
 * Check if token is part of a declaration (property-value pair)
 * @param {Number} i Token's index number
 * @return {Number} Length of the declaration
 */
function checkBlockdecl(i) {
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkBlockdecl1(i)) tokens[i].bd_type = 1;
  else if (l = checkBlockdecl2(i)) tokens[i].bd_type = 2;
  else if (l = checkBlockdecl3(i)) tokens[i].bd_type = 3;
  else if (l = checkBlockdecl4(i)) tokens[i].bd_type = 4;
  else return 0;

  return l;
}

/**
 * @return {Array}
 */
function getBlockdecl() {
  const childType = tokens[pos].bd_type;

  if (childType === 1) return getBlockdecl1();
  if (childType === 2) return getBlockdecl2();
  if (childType === 3) return getBlockdecl3();
  if (childType === 4) return getBlockdecl4();
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkBlockdecl1(i) {
  const start = i;
  let l;

  if (l = checkSC(i)) i += l;

  if (l = checkDeclaration(i)) tokens[i].bd_kind = 1;
  else if (l = checkAtrule(i)) tokens[i].bd_kind = 2;
  else return 0;

  i += l;

  if (l = checkSC(i)) i += l;

  if (i < tokensLength && (l = checkDeclDelim(i))) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Array}
 */
function getBlockdecl1() {
  const sc = getSC();
  let content;

  switch (tokens[pos].bd_kind) {
    case 1:
      content = getDeclaration();
      break;
    case 2:
      content = getAtrule();
      break;
  }

  return sc.concat(
    content,
    getSC(),
    getDeclDelim(),
    getSC()
  );
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkBlockdecl2(i) {
  const start = i;
  let l;

  if (l = checkSC(i)) i += l;

  if (l = checkDeclaration(i)) tokens[i].bd_kind = 1;
  else if (l = checkAtrule(i)) tokens[i].bd_kind = 2;
  else return 0;

  i += l;

  if (l = checkSC(i)) i += l;

  return i - start;
}

/**
 * @return {Array}
 */
function getBlockdecl2() {
  const sc = getSC();
  let content;

  switch (tokens[pos].bd_kind) {
    case 1:
      content = getDeclaration();
      break;
    case 2:
      content = getAtrule();
      break;
  }

  return sc.concat(
    content,
    getSC()
  );
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkBlockdecl3(i) {
  const start = i;
  let l;

  if (l = checkSC(i)) i += l;

  if (l = checkDeclDelim(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  return i - start;
}

/**
 * @return {Array}
 */
function getBlockdecl3() {
  return [].concat(
    getSC(),
    getDeclDelim(),
    getSC()
  );
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkBlockdecl4(i) {
  return checkSC(i);
}

/**
 * @return {Array}
 */
function getBlockdecl4() {
  return getSC();
}

/**
 * Check if token is part of text inside square brackets, e.g. `[1]`
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkBrackets(i) {
  if (i >= tokensLength) return 0;

  const start = i;

  // Skip `[`.
  if (tokens[i].type === TokenType.LeftSquareBracket) i++;
  else return 0;

  if (i < tokens[start].right) {
    const l = checkTsets(i);
    if (l) i += l;
    else return 0;
  }

  // Skip `]`.
  i++;

  return i - start;
}

/**
 * Get node with text inside square brackets, e.g. `[1]`
 * @return {Node}
 */
function getBrackets() {
  const type = NodeType.BracketsType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const right = token.right;
  let content = [];

  // Skip `[`.
  pos++;

  if (pos < right) {
    content = getTsets();
  }

  const end = getLastPosition(content, line, column, 1);

  // Skip `]`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * Check if token is part of a class selector (e.g. `.abc`)
 * @param {Number} i Token's index number
 * @return {Number} Length of the class selector
 */
function checkClass(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].class_l) return tokens[i].class_l;

  // Skip `.`.
  if (tokens[i].type === TokenType.FullStop) i++;
  else return 0;

  if (l = checkIdent(i)) {
    tokens[start].class_l = l + 1;
    i += l;
  } else return 0;

  tokens[start].classEnd = i;

  return i - start;
}

/**
 * Get node with a class selector
 * @return {Node}
 */
function getClass() {
  const type = NodeType.ClassType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `.`
  pos++;

  const content = [getIdent()];

  return newNode(type, content, line, column);
}

function checkCombinator(i) {
  if (i >= tokensLength) return 0;

  let l;
  if (l = checkCombinator1(i)) tokens[i].combinatorType = 1;
  else if (l = checkCombinator2(i)) tokens[i].combinatorType = 2;
  else if (l = checkCombinator3(i)) tokens[i].combinatorType = 3;
  else if (l = checkCombinator4(i)) tokens[i].combinatorType = 4;

  return l;
}

function getCombinator() {
  const type = tokens[pos].combinatorType;
  if (type === 1) return getCombinator1();
  if (type === 2) return getCombinator2();
  if (type === 3) return getCombinator3();
  if (type === 4) return getCombinator4();
}

/**
 * (1) `>>>`
 *
 * @param {Number} i
 * @return {Number}
 */
function checkCombinator1(i) {
  if (i < tokensLength && tokens[i++].type === TokenType.GreaterThanSign &&
      i < tokensLength && tokens[i++].type === TokenType.GreaterThanSign &&
      i < tokensLength && tokens[i++].type === TokenType.GreaterThanSign)
    return 3;

  return 0;
}

/**
 * @return {Node}
 */
function getCombinator1() {
  const type = NodeType.CombinatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = `>>>`;

  // Skip combinator
  pos += 3;

  return newNode(type, content, line, column);
}

/**
 * (1) `||`
 * (2) `>>`
 *
 * @param {Number} i
 * @return {Number}
 */
function checkCombinator2(i) {
  if (i + 1 >= tokensLength) return 0;

  if (tokens[i].type === TokenType.VerticalLine &&
      tokens[i + 1].type === TokenType.VerticalLine) return 2;

  if (tokens[i].type === TokenType.GreaterThanSign &&
      tokens[i + 1].type === TokenType.GreaterThanSign) return 2;

  return 0;
}

/**
 * @return {Node}
 */
function getCombinator2() {
  const type = NodeType.CombinatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = `${token.value}${tokens[pos + 1].value}`;

  // Skip combinator
  pos += 2;

  return newNode(type, content, line, column);
}

/**
 * (1) `>`
 * (2) `+`
 * (3) `~`
 *
 * @param {Number} i
 * @return {Number}
 */
function checkCombinator3(i) {
  const type = tokens[i].type;
  if (type === TokenType.PlusSign ||
      type === TokenType.GreaterThanSign ||
      type === TokenType.Tilde) return 1;
  else return 0;
}

/**
 * @return {Node}
 */
function getCombinator3() {
  const type = NodeType.CombinatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = token.value;

  // Skip combinator
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (1) `/panda/`
 */
function checkCombinator4(i) {
  const start = i;

  if (tokens[i].type === TokenType.Solidus) i++;
  else return 0;

  let l;
  if (l = checkIdent(i)) i += l;
  else return 0;

  if (tokens[i].type === TokenType.Solidus) i++;
  else return 0;

  return i - start;
}

/**
 * @return {Node}
 */
function getCombinator4() {
  const type = NodeType.CombinatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `/`.
  pos++;

  const ident = getIdent();

  // Skip `/`.
  pos++;

  const content = `/${ident.content}/`;

  return newNode(type, content, line, column);
}

/**
 * Check if token is a multiline comment.
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is a multiline comment, otherwise `0`
 */
function checkCommentML(i) {
  return i < tokensLength && tokens[i].type === TokenType.CommentML ? 1 : 0;
}

/**
 * Get node with a multiline comment
 * @return {Node}
 */
function getCommentML() {
  const type = NodeType.CommentMLType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = tokens[pos].value.substring(2);
  const l = content.length;

  if (content.charAt(l - 2) === '*' && content.charAt(l - 1) === '/')
    content = content.substring(0, l - 2);

  const end = getLastPosition(content, line, column, 2);
  if (end[0] === line) end[1] += 2;
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * Check if token is part of a declaration (property-value pair)
 * @param {Number} i Token's index number
 * @return {Number} Length of the declaration
 */
function checkDeclaration(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkProperty(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkPropertyDelim(i)) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkValue(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a declaration
 * @return {Node}
 */
function getDeclaration() {
  const type = NodeType.DeclarationType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getProperty(),
    getSC(),
    getPropertyDelim(),
    getSC(),
    getValue()
  );

  return newNode(type, content, line, column);
}

/**
 * Check if token is a semicolon
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is a semicolon, otherwise `0`
 */
function checkDeclDelim(i) {
  return i < tokensLength && tokens[i].type === TokenType.Semicolon ? 1 : 0;
}

/**
 * Get node with a semicolon
 * @return {Node}
 */
function getDeclDelim() {
  const type = NodeType.DeclDelimType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = ';';

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Check if token is a comma
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is a comma, otherwise `0`
 */
function checkDelim(i) {
  return i < tokensLength && tokens[i].type === TokenType.Comma ? 1 : 0;
}

/**
 * Get node with a comma
 * @return {Node}
 */
function getDelim() {
  const type = NodeType.DelimType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = ',';

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a number with dimension unit (e.g. `10px`)
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkDimension(i) {
  const ln = checkNumber(i);
  let li;

  if (i >= tokensLength ||
      !ln ||
      i + ln >= tokensLength) return 0;

  return (li = checkUnit(i + ln)) ? ln + li : 0;
}

/**
 * Get node of a number with dimension unit
 * @return {Node}
 */
function getDimension() {
  const type = NodeType.DimensionType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [
    getNumber(),
    getUnit()
  ];

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkExpression(i) {
  const start = i;

  if (i >= tokensLength || tokens[i++].value !== 'expression' ||
      i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis) {
    return 0;
  }

  return tokens[i].right - start + 1;
}

/**
 * @return {Node}
 */
function getExpression() {
  const type = NodeType.ExpressionType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  pos++;

  const content = joinValues(pos + 1, tokens[pos].right - 1);
  const end = getLastPosition(content, line, column, 1);

  if (end[0] === line) end[1] += 11;
  pos = tokens[pos].right + 1;

  return newNode(type, content, line, column, end);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkFunction(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i < tokensLength && tokens[i].type === TokenType.LeftParenthesis ?
      tokens[i].right - start + 1 : 0;
}

/**
 * @return {Node}
 */
function getFunction() {
  const type = NodeType.FunctionType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getIdent(),
    getArguments()
  );

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of an identifierю
 * Grammar from CSS spec:
 *   h         [0-9a-f]
 *   nonascii  [\240-\377]
 *   unicode   \\{h}{1,6}(\r\n|[ \t\r\n\f])?
 *   escape    {unicode}|\\[^\r\n\f0-9a-f]
 *   nmstart   [_a-z]|{nonascii}|{escape}
 *   nmchar    [_a-z0-9-]|{nonascii}|{escape}
 *   ident     -?{nmstart}{nmchar}*
 *
 * @param {number} i Token's index number
 * @return {number} Length of the identifier
 */
function checkIdent(i) {
  const start = i;

  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.HyphenMinus) i++;

  if (tokens[i].type === TokenType.LowLine ||
      tokens[i].type === TokenType.Identifier) i++;
  else return 0;

  for (; i < tokensLength; i++) {
    if (tokens[i].type !== TokenType.HyphenMinus &&
        tokens[i].type !== TokenType.LowLine &&
        tokens[i].type !== TokenType.Identifier &&
        tokens[i].type !== TokenType.DecimalNumber) break;
  }

  tokens[start].ident_last = i - 1;

  return i - start;
}

/**
 * Get node with an identifier
 * @return {Node}
 */
function getIdent() {
  const type = NodeType.IdentType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = joinValues(pos, tokens[pos].ident_last);

  pos = tokens[pos].ident_last + 1;

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of `!important` word
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkImportant(i) {
  const start = i;
  let l;

  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.ExclamationMark) return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].value === 'important') {
    tokens[start].importantEnd = i;
    return i - start + 1;
  } else {
    return 0;
  }
}

/**
 * Get node with `!important` word
 * @return {Node}
 */
function getImportant() {
  const type = NodeType.ImportantType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = joinValues(pos, token.importantEnd);

  pos = token.importantEnd + 1;

  return newNode(type, content, line, column);
}

/**
 * Check a single keyframe block - `5% {}`
 * @param {Number} i
 * @returns {Number}
 */
function checkKeyframesBlock(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkKeyframesSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get a single keyframe block - `5% {}`
 * @returns {Node}
 */
function getKeyframesBlock() {
  const type = NodeType.RulesetType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getKeyframesSelectorsGroup(),
    getSC(),
    getBlock()
  );

  return newNode(type, content, line, column);
}

/**
 * Check all keyframe blocks - `5% {} 100% {}`
 * @param {Number} i
 * @returns {Number}
 */
function checkKeyframesBlocks(i) {
  const start = i;
  let l;

  if (i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkKeyframesBlock(i)) i += l;
  else return 0;

  while (tokens[i].type !== TokenType.RightCurlyBracket) {
    if (l = checkSC(i)) i += l;
    else if (l = checkKeyframesBlock(i)) i += l;
    else break;
  }

  if (i < tokensLength && tokens[i].type === TokenType.RightCurlyBracket) i++;
  else return 0;

  return i - start;
}

/**
 * Get all keyframe blocks - `5% {} 100% {}`
 * @returns {Node}
 */
function getKeyframesBlocks() {
  const type = NodeType.BlockType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const keyframesBlocksEnd = token.right;
  let content = [];

  // Skip `{`.
  pos++;

  while (pos < keyframesBlocksEnd) {
    if (checkSC(pos)) content = content.concat(getSC());
    else if (checkKeyframesBlock(pos)) content.push(getKeyframesBlock());
  }

  const end = getLastPosition(content, line, column, 1);

  // Skip `}`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * Check if token is part of a @keyframes rule.
 * @param {Number} i Token's index number
 * @return {Number} Length of the @keyframes rule
 */
function checkKeyframesRule(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  const atruleName = joinValues2(i - l, l);
  if (atruleName.toLowerCase().indexOf('keyframes') === -1) return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkKeyframesBlocks(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Node}
 */
function getKeyframesRule() {
  const type = NodeType.AtruleType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getAtkeyword(),
    getSC(),
    getIdent(),
    getSC(),
    getKeyframesBlocks()
  );

  return newNode(type, content, line, column);
}

/**
 * Check a single keyframe selector - `5%`, `from` etc
 * @param {Number} i
 * @returns {Number}
 */
function checkKeyframesSelector(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) {
    // Valid selectors are only `from` and `to`.
    const selector = joinValues2(i, l);
    if (selector !== 'from' && selector !== 'to') return 0;

    i += l;
    tokens[start].keyframesSelectorType = 1;
  } else if (l = checkPercentage(i)) {
    i += l;
    tokens[start].keyframesSelectorType = 2;
  } else {
    return 0;
  }

  return i - start;
}

/**
 * Get a single keyframe selector
 * @returns {Node}
 */
function getKeyframesSelector() {
  const keyframesSelectorType = NodeType.KeyframesSelectorType;
  const selectorType = NodeType.SelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  if (token.keyframesSelectorType === 1) {
    content.push(getIdent());
  } else {
    content.push(getPercentage());
  }

  const keyframesSelector = newNode(
    keyframesSelectorType,
    content,
    line,
    column
  );

  return newNode(selectorType, [keyframesSelector], line, column);
}

/**
 * Check the keyframe's selector groups
 * @param {Number} i
 * @returns {Number}
 */
function checkKeyframesSelectorsGroup(i) {
  const start = i;
  let l;

  if (l = checkKeyframesSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    const spaceBefore = checkSC(i);
    const comma = checkDelim(i + spaceBefore);
    if (!comma) break;

    const spaceAfter = checkSC(i + spaceBefore + comma);
    if (l = checkKeyframesSelector(i + spaceBefore + comma + spaceAfter)) {
      i += spaceBefore + comma + spaceAfter + l;
    } else break;
  }

  tokens[start].selectorsGroupEnd = i;

  return i - start;
}

/**
 * Get the keyframe's selector groups
 * @returns {Array} An array of keyframe selectors
 */
function getKeyframesSelectorsGroup() {
  let selectorsGroup = [];
  const selectorsGroupEnd = tokens[pos].selectorsGroupEnd;

  selectorsGroup.push(getKeyframesSelector());

  while (pos < selectorsGroupEnd) {
    selectorsGroup = selectorsGroup.concat(
      getSC(),
      getDelim(),
      getSC(),
      getKeyframesSelector()
    );
  }

  return selectorsGroup;
}

/**
 * Check if token is a namespace sign (`|`)
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is `|`, `0` if not
 */
function checkNamespace(i) {
  return i < tokensLength && tokens[i].type === TokenType.VerticalLine ? 1 : 0;
}

/**
 * Get node with a namespace sign
 * @return {Node}
 */
function getNamespace() {
  const type = NodeType.NamespaceType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = '|';

  pos++;

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkNmName2(i) {
  if (tokens[i].type === TokenType.Identifier) return 1;
  else if (tokens[i].type !== TokenType.DecimalNumber) return 0;

  i++;

  return i < tokensLength && tokens[i].type === TokenType.Identifier ? 2 : 1;
}

/**
 * @return {String}
 */
function getNmName2() {
  let s = tokens[pos].value;

  if (tokens[pos++].type === TokenType.DecimalNumber &&
      pos < tokensLength &&
      tokens[pos].type === TokenType.Identifier) s += tokens[pos++].value;

  return s;
}

/**
 * Check if token is part of a number
 * @param {Number} i Token's index number
 * @return {Number} Length of number
 */
function checkNumber(i) {
  if (i >= tokensLength) return 0;

  if (tokens[i].number_l) return tokens[i].number_l;

  // `10`:
  if (i < tokensLength && tokens[i].type === TokenType.DecimalNumber &&
      (!tokens[i + 1] ||
      (tokens[i + 1] && tokens[i + 1].type !== TokenType.FullStop))) {
    tokens[i].number_l = 1;
    return 1;
  }

  // `10.`:
  if (i < tokensLength &&
      tokens[i].type === TokenType.DecimalNumber &&
      tokens[i + 1] && tokens[i + 1].type === TokenType.FullStop &&
      (!tokens[i + 2] || (tokens[i + 2].type !== TokenType.DecimalNumber))) {
    tokens[i].number_l = 2;
    return 2;
  }

  // `.10`:
  if (i < tokensLength &&
      tokens[i].type === TokenType.FullStop &&
      tokens[i + 1].type === TokenType.DecimalNumber) {
    tokens[i].number_l = 2;
    return 2;
  }

  // `10.10`:
  if (i < tokensLength &&
      tokens[i].type === TokenType.DecimalNumber &&
      tokens[i + 1] && tokens[i + 1].type === TokenType.FullStop &&
      tokens[i + 2] && tokens[i + 2].type === TokenType.DecimalNumber) {
    tokens[i].number_l = 3;
    return 3;
  }

  return 0;
}

/**
 * Get node with number
 * @return {Node}
 */
function getNumber() {
  const type = NodeType.NumberType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const l = tokens[pos].number_l;
  let content = '';

  for (let j = 0; j < l; j++) {
    content += tokens[pos + j].value;
  }

  pos += l;

  return newNode(type, content, line, column);
}

/**
 * Check if token is an operator (`/`, `,`, `:`, `=`, `*`).
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is an operator, otherwise `0`
 */
function checkOperator(i) {
  if (i >= tokensLength) return 0;

  switch (tokens[i].type) {
    case TokenType.Solidus:
    case TokenType.Comma:
    case TokenType.Colon:
    case TokenType.EqualsSign:
    case TokenType.Asterisk:
      return 1;
  }

  return 0;
}

/**
 * Get node with an operator
 * @return {Node}
 */
function getOperator() {
  const type = NodeType.OperatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = token.value;

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of text inside parentheses, e.g. `(1)`
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkParentheses(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  const right = tokens[i].right;

  // Skip `(`.
  if (tokens[i].type === TokenType.LeftParenthesis) i++;
  else return 0;

  if (i < right) {
    const l = checkTsets(i);
    if (l) i += l;
    else return 0;
  }

  // Skip `)`.
  i++;

  return i - start;
}

/**
 * Get node with text inside parentheses, e.g. `(1)`
 * @return {Node}
 */
function getParentheses() {
  const type = NodeType.ParenthesesType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const right = token.right;
  let content = [];

  // Skip `(`.
  pos++;

  if (pos < right) {
    content = getTsets();
  }

  const end = getLastPosition(content, line, column, 1);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * Check if token is part of a number with percent sign (e.g. `10%`)
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkPercentage(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkNumber(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;

  // Skip `%`.
  if (tokens[i].type === TokenType.PercentSign) i++;
  else return 0;

  return i - start;
}

/**
 * Get node of number with percent sign
 * @return {Node}
 */
function getPercentage() {
  const type = NodeType.PercentageType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [getNumber()];
  const end = getLastPosition(content, line, column, 1);

  // Skip `%`.
  pos++;

  return newNode(type, content, line, column, end);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkProgid(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (joinValues2(i, 6) === 'progid:DXImageTransform.Microsoft.') i += 6;
  else return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].type === TokenType.LeftParenthesis) {
    tokens[start].progid_end = tokens[i].right;
    i = tokens[i].right + 1;
  } else return 0;

  return i - start;
}

/**
 * @return {Node}
 */
function getProgid() {
  const type = NodeType.ProgidType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const progid_end = token.progid_end;
  const content = joinValues(pos, progid_end);

  pos = progid_end + 1;

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a property
 * @param {Number} i Token's index number
 * @return {Number} Length of the property
 */
function checkProperty(i) {
  const start = i;
  let l;

  if (l = checkProperty1(i)) tokens[start].propertyType = 1;
  else if (l = checkProperty2(i)) tokens[start].propertyType = 2;

  return l;
}

/**
 * Get node with a property
 * @return {Node}
 */
function getProperty() {
  const type = tokens[pos].propertyType;

  if (type === 1) return getProperty1();
  if (type === 2) return getProperty2();
}

/**
 * Check if token is part of a property
 * @param {Number} i Token's index number
 * @return {Number} Length of the property
 */
function checkProperty1(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a property
 * @return {Node}
 */
function getProperty1() {
  const type = NodeType.PropertyType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a custom property
 * @param {Number} i Token's index number
 * @return {Number} Length of the property
 */
function checkProperty2(i) {
  return checkCustomProperty(i);
}

/**
 * Get node with a custom property
 * @return {Node}
 */
function getProperty2() {
  return getCustomProperty();
}

/**
 * Check if token is part of a custom property
 * @param {Number} i Token's index number
 * @return {Number} Length of the property
 */
function checkCustomProperty(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type !== TokenType.HyphenMinus ||
      tokens[i + 1] && tokens[i + 1].type !== TokenType.HyphenMinus) return 0;

  // Skip `--`
  i += 2;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a custom property
 * @return {Node}
 */
function getCustomProperty() {
  const type = NodeType.CustomPropertyType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `--`
  pos += 2;

  const content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * Check if token is a colon
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is a colon, otherwise `0`
 */
function checkPropertyDelim(i) {
  return i < tokensLength && tokens[i].type === TokenType.Colon ? 1 : 0;
}

/**
 * Get node with a colon
 * @return {Node}
 */
function getPropertyDelim() {
  const type = NodeType.PropertyDelimType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = ':';

  // Skip `:`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkPseudo(i) {
  return checkPseudoe(i) ||
      checkPseudoc(i);
}

/**
 * @return {Node}
 */
function getPseudo() {
  if (checkPseudoe(pos)) return getPseudoe();
  if (checkPseudoc(pos)) return getPseudoc();
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkPseudoe(i) {
  let l;

  // Check `::`
  if (i >= tokensLength || tokens[i].type !== TokenType.Colon ||
      i >= tokensLength || tokens[i + 1].type !== TokenType.Colon) return 0;

  if (l = checkPseudoElement1(i)) tokens[i].pseudoElementType = 1;
  else if (l = checkPseudoElement2(i)) tokens[i].pseudoElementType = 2;
  else return 0;

  return l;
}

/**
 * @return {Node}
 */
function getPseudoe() {
  const childType = tokens[pos].pseudoElementType;
  if (childType === 1) return getPseudoElement1();
  if (childType === 2) return getPseudoElement2();
}

/**
 * (1) `::slotted(selector)`
 * (2) `::slotted(selector, selector)`
 */
function checkPseudoElement1(i) {
  const start = i;
  let l;

  // Skip `::`.
  i += 2;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

/**
 * (1) `::slotted(selector)`
 * (2) `::slotted(selector, selector)`
 */
function getPseudoElement1() {
  const type = NodeType.PseudoeType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `::`.
  pos += 2;

  content.push(getIdent());

  {
    const type = NodeType.ArgumentsType;
    const token = tokens[pos];
    const line = token.ln;
    const column = token.col;

    // Skip `(`.
    pos++;

    const selectorContent = [].concat(
      getSC(),
      getSelectorsGroup(),
      getSC()
    );

    const end = getLastPosition(selectorContent, line, column, 1);
    const args = newNode(type, selectorContent, line, column, end);
    content.push(args);

    // Skip `)`.
    pos++;
  }

  return newNode(type, content, line, column);
}

function checkPseudoElement2(i) {
  const start = i;
  let l;

  // Skip `::`.
  i += 2;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Node}
 */
function getPseudoElement2() {
  const type = NodeType.PseudoeType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `::`.
  pos += 2;

  let content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkPseudoc(i) {
  let l;

  if (i >= tokensLength || tokens[i].type !== TokenType.Colon) return 0;

  if (l = checkPseudoClass1(i)) tokens[i].pseudoClassType = 1;
  else if (l = checkPseudoClass2(i)) tokens[i].pseudoClassType = 2;
  else if (l = checkPseudoClass3(i)) tokens[i].pseudoClassType = 3;
  else if (l = checkPseudoClass4(i)) tokens[i].pseudoClassType = 4;
  else if (l = checkPseudoClass5(i)) tokens[i].pseudoClassType = 5;
  else if (l = checkPseudoClass6(i)) tokens[i].pseudoClassType = 6;
  else return 0;

  return l;
}

/**
 * @return {Node}
 */
function getPseudoc() {
  const childType = tokens[pos].pseudoClassType;
  if (childType === 1) return getPseudoClass1();
  if (childType === 2) return getPseudoClass2();
  if (childType === 3) return getPseudoClass3();
  if (childType === 4) return getPseudoClass4();
  if (childType === 5) return getPseudoClass5();
  if (childType === 6) return getPseudoClass6();
}

/**
 * (1) `:panda(selector)`
 * (2) `:panda(selector, selector)`
 */
function checkPseudoClass1(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

/**
 * (-) `:not(panda)`
 */
function getPseudoClass1() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `:`.
  pos++;

  content.push(getIdent());

  {
    const type = NodeType.ArgumentsType;
    const token = tokens[pos];
    const line = token.ln;
    const column = token.col;

    // Skip `(`.
    pos++;

    const selectorContent = [].concat(
      getSC(),
      getSelectorsGroup(),
      getSC()
    );

    const end = getLastPosition(selectorContent, line, column, 1);
    const args = newNode(type, selectorContent, line, column, end);
    content.push(args);

    // Skip `)`.
    pos++;
  }

  return newNode(type, content, line, column);
}

/**
 * (1) `:nth-child(odd)`
 * (2) `:nth-child(even)`
 * (3) `:lang(de-DE)`
 */
function checkPseudoClass2(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

function getPseudoClass2() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `:`.
  pos++;

  content.push(getIdent());

  // Skip `(`.
  pos++;

  const l = tokens[pos].ln;
  const c = tokens[pos].col;
  const value = [].concat(
    getSC(),
    getIdent(),
    getSC()
  );

  const end = getLastPosition(value, l, c, 1);
  const args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(-3n + 2)`
 */
function checkPseudoClass3(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;

  if (i >= tokensLength) return 0;
  if (tokens[i].type === TokenType.DecimalNumber) i++;

  if (i >= tokensLength) return 0;
  if (tokens[i].value === 'n') i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.PlusSign ||
      tokens[i].type === TokenType.HyphenMinus) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].type === TokenType.DecimalNumber) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

function getPseudoClass3() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `:`.
  pos++;

  content.push(getIdent());

  const l = tokens[pos].ln;
  const c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  value = value.concat(getSC());

  if (checkUnary(pos)) value.push(getUnary());
  if (checkNumber(pos)) value.push(getNumber());

  {
    const l = tokens[pos].ln;
    const c = tokens[pos].col;
    const content = tokens[pos].value;
    const ident = newNode(NodeType.IdentType, content, l, c);
    value.push(ident);
    pos++;
  }

  value = value.concat(getSC());

  if (checkUnary(pos)) value.push(getUnary());

  value = value.concat(getSC());

  if (checkNumber(pos)) value.push(getNumber());

  value = value.concat(getSC());

  const end = getLastPosition(value, l, c, 1);
  const args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(-3n)`
 */
function checkPseudoClass4(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;
  if (tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;
  if (tokens[i].type === TokenType.DecimalNumber) i++;

  if (tokens[i].value === 'n') i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

function getPseudoClass4() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `:`.
  pos++;

  content.push(getIdent());

  const l = tokens[pos].ln;
  const c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  value = value.concat(getSC());

  if (checkUnary(pos)) value.push(getUnary());
  if (checkNumber(pos)) value.push(getNumber());
  if (checkIdent(pos)) value.push(getIdent());

  value = value.concat(getSC());

  const end = getLastPosition(value, l, c, 1);
  const args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(+8)`
 */
function checkPseudoClass5(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;
  if (tokens[i].type !== TokenType.LeftParenthesis) return 0;

  const right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;
  if (tokens[i].type === TokenType.DecimalNumber) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  // Skip `)`.
  i++;

  return i - start;
}

function getPseudoClass5() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  // Skip `:`.
  pos++;

  content.push(getIdent());

  const l = tokens[pos].ln;
  const c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  value = value.concat(getSC());

  if (checkUnary(pos)) value.push(getUnary());
  if (checkNumber(pos)) value.push(getNumber());

  value = value.concat(getSC());

  const end = getLastPosition(value, l, c, 1);
  const args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:checked`
 */
function checkPseudoClass6(i) {
  const start = i;
  let l;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

function getPseudoClass6() {
  const type = NodeType.PseudocType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `:`.
  pos++;

  const content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkRuleset(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Node}
 */
function getRuleset() {
  const type = NodeType.RulesetType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [].concat(
    getSelectorsGroup(),
    getSC(),
    getBlock()
  );

  return newNode(type, content, line, column);
}

/**
 * Check if token is marked as a space (if it's a space or a tab
 *      or a line break).
 * @param {Number} i
 * @return {Number} Number of spaces in a row starting with the given token.
 */
function checkS(i) {
  return i < tokensLength && tokens[i].ws ? tokens[i].ws_last - i + 1 : 0;
}

/**
 * Get node with spaces
 * @return {Node}
 */
function getS() {
  const type = NodeType.SType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = joinValues(pos, tokens[pos].ws_last);

  pos = tokens[pos].ws_last + 1;

  return newNode(type, content, line, column);
}

/**
 * Check if token is a space or a comment.
 * @param {Number} i Token's index number
 * @return {Number} Number of similar (space or comment) tokens
 *      in a row starting with the given token.
 */
function checkSC(i) {
  if (i >= tokensLength) return 0;

  let l;
  let lsc = 0;

  while (i < tokensLength) {
    if (l = checkS(i)) tokens[i].sc_child = 1;
    else if (l = checkCommentML(i)) tokens[i].sc_child = 2;
    else break;

    i += l;
    lsc += l;
  }

  return lsc || 0;
}

/**
 * Get node with spaces and comments
 * @return {Array}
 */
function getSC() {
  const sc = [];

  if (pos >= tokensLength) return sc;

  while (pos < tokensLength) {
    const childType = tokens[pos].sc_child;

    if (childType === 1) sc.push(getS());
    else if (childType === 2) sc.push(getCommentML());
    else break;
  }

  return sc;
}

/**
 * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
 *      a simple selector
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkShash(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.NumberSign) i++;
  else return 0;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a hexadecimal number (e.g. `#fff`) inside a simple
 *      selector
 * @return {Node}
 */
function getShash() {
  const type = NodeType.ShashType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `#`.
  pos++;

  const content = [getIdent()];

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a string (text wrapped in quotes)
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is part of a string, `0` if not
 */
function checkString(i) {
  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.StringSQ ||
      tokens[i].type === TokenType.StringDQ) {
    return 1;
  }

  return 0;
}

/**
 * Get string's node
 * @return {Array} `['string', x]` where `x` is a string (including
 *      quotes).
 */
function getString() {
  const type = NodeType.StringType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = token.value;

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Validate stylesheet: it should consist of any number (0 or more) of
 * rulesets (sets of rules with selectors), @-rules, whitespaces or
 * comments.
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkStylesheet(i) {
  const start = i;
  let l;

  while (i < tokensLength) {
    if (l = checkSC(i)) tokens[i].stylesheet_child = 1;
    else if (l = checkRuleset(i)) tokens[i].stylesheet_child = 2;
    else if (l = checkAtrule(i)) tokens[i].stylesheet_child = 3;
    else if (l = checkDeclDelim(i)) tokens[i].stylesheet_child = 4;
    else throwError(i);

    i += l;
  }

  return i - start;
}

/**
 * @return {Array} `['stylesheet', x]` where `x` is all stylesheet's
 *      nodes.
 */
function getStylesheet() {
  const type = NodeType.StylesheetType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  while (pos < tokensLength) {
    const childType = tokens[pos].stylesheet_child;

    if (childType === 1) content = content.concat(getSC());
    if (childType === 2) content.push(getRuleset());
    if (childType === 3) content.push(getAtrule());
    if (childType === 4) content.push(getDeclDelim());
  }

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkTset(i) {
  let l;

  if (l = checkVhash(i)) tokens[i].tset_child = 1;
  else if (l = checkAny(i)) tokens[i].tset_child = 2;
  else if (l = checkSC(i)) tokens[i].tset_child = 3;
  else if (l = checkOperator(i)) tokens[i].tset_child = 4;

  return l;
}

/**
 * @return {Array}
 */
function getTset() {
  const childType = tokens[pos].tset_child;

  if (childType === 1) return getVhash();
  if (childType === 2) return getAny();
  if (childType === 3) return getSC();
  if (childType === 4) return getOperator();
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkTsets(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  while (l = checkTset(i)) {
    i += l;
  }

  tokens[start].tsets_end = i;
  return i - start;
}

/**
 * @return {Array}
 */
function getTsets() {
  let content = [];
  let t;

  if (pos >= tokensLength) return content;

  const end = tokens[pos].tsets_end;
  while (pos < end) {
    t = getTset();
    if (typeof t.content === 'string') content.push(t);
    else content = content.concat(t);
  }

  return content;
}

/**
 * Check if token is an unary (arithmetical) sign (`+` or `-`)
 * @param {Number} i Token's index number
 * @return {Number} `1` if token is an unary sign, `0` if not
 */
function checkUnary(i) {
  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.HyphenMinus ||
      tokens[i].type === TokenType.PlusSign) {
    return 1;
  }

  return 0;
}

/**
 * Get node with an unary (arithmetical) sign (`+` or `-`)
 * @return {Array} `['unary', x]` where `x` is an unary sign
 *      converted to string.
 */
function getUnary() {
  const type = NodeType.OperatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = token.value;

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Check if token is a unicode range (single or multiple <urange> nodes)
 * @param {number} i Token's index
 * @return {number} Unicode range node's length
 */
function checkUnicodeRange(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkUrange(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    const spaceBefore = checkSC(i);
    const comma = checkDelim(i + spaceBefore);
    if (!comma) break;

    const spaceAfter = checkSC(i + spaceBefore + comma);
    if (l = checkUrange(i + spaceBefore + comma + spaceAfter)) {
      i += spaceBefore + comma + spaceAfter + l;
    } else break;
  }

  return i - start;
}

/**
 * Get a unicode range node
 * @return {Node}
 */
function getUnicodeRange() {
  const type = NodeType.UnicodeRangeType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  while (pos < tokensLength) {
    if (checkSC(pos)) content = content.concat(getSC());
    else if (checkDelim(pos)) content.push(getDelim());
    else if (checkUrange(pos)) content.push(getUrange());
    else break;
  }

  return newNode(type, content, line, column);
}

/**
 * Check if token is unit
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkUnit(i) {
  const units = [
    'em', 'ex', 'ch', 'rem',
    'vh', 'vw', 'vmin', 'vmax',
    'px', 'mm', 'q', 'cm', 'in', 'pt', 'pc',
    'deg', 'grad', 'rad', 'turn',
    's', 'ms',
    'Hz', 'kHz',
    'dpi', 'dpcm', 'dppx'
  ];

  return units.indexOf(tokens[i].value) !== -1 ? 1 : 0;
}

/**
 * Get unit node of type ident
 * @return {Node} An ident node containing the unit value
 */
function getUnit() {
  const type = NodeType.IdentType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = token.value;

  pos++;

  return newNode(type, content, line, column);
}

/**
 * Check if token is a u-range (part of a unicode-range)
 * (1) `U+416`
 * (2) `U+400-4ff`
 * (3) `U+4??`
 * @param {number} i Token's index
 * @return {number} Urange node's length
 */
function checkUrange(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  // Check for unicode prefix (u+ or U+)
  if (tokens[i].value === 'U' || tokens[i].value === 'u') i += 1;
  else return 0;

  if (i >= tokensLength) return 0;

  if (tokens[i].value === '+') i += 1;
  else return 0;

  while (i < tokensLength) {
    if (l = checkIdent(i)) i += l;
    else if (l = checkNumber(i)) i += l;
    else if (l = checkUnary(i)) i += l;
    else if (l = _checkUnicodeWildcard(i)) i += l;
    else break;
  }

  tokens[start].urangeEnd = i - 1;

  return i - start;
}

/**
 * Get a u-range node (part of a unicode-range)
 * @return {Node}
 */
function getUrange() {
  const startPos = pos;
  const type = NodeType.UrangeType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  content = joinValues(startPos, tokens[startPos].urangeEnd);
  pos = tokens[startPos].urangeEnd + 1;

  return newNode(type, content, line, column);
}

/**
 * Check for unicode wildcard characters `?`
 * @param {number} i Token's index
 * @return {number} Wildcard length
 */
function _checkUnicodeWildcard(i) {
  const start = i;

  if (i >= tokensLength) return 0;

  while (i < tokensLength) {
    if (tokens[i].type === TokenType.QuestionMark) i += 1;
    else break;
  }

  return i - start;
}

/**
 * Check if token is part of URI (e.g. `url('/css/styles.css')`)
 * @param {Number} i Token's index number
 * @return {Number} Length of URI
 */
function checkUri(i) {
  const start = i;

  if (i >= tokensLength || tokens[i].value !== 'url') return 0;

  // Skip `url`.
  i++;

  if (i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis)
    return 0;

  return tokens[i].right - start + 1;
}

/**
 * Get node with URI
 * @return {Array} `['uri', x]` where `x` is URI's nodes (without `url`
 *      and braces, e.g. `['string', ''/css/styles.css'']`).
 */
function getUri() {
  const startPos = pos;
  const uriExcluding = {};
  let uri;
  let l;
  let raw;

  let rawContent;
  let t;

  pos += 2;

  uriExcluding[TokenType.Space] = 1;
  uriExcluding[TokenType.Tab] = 1;
  uriExcluding[TokenType.Newline] = 1;
  uriExcluding[TokenType.LeftParenthesis] = 1;
  uriExcluding[TokenType.RightParenthesis] = 1;

  if (checkUri1(pos)) {
    uri = [].concat(
      getSC(),
      getString(),
      getSC()
    );
  } else {
    uri = checkSC(pos) ? getSC() : [];
    l = checkExcluding(uriExcluding, pos);
    rawContent = joinValues(pos, pos + l);
    t = tokens[pos];
    raw = newNode(NodeType.RawType, rawContent, t.ln, t.col);

    uri.push(raw);

    pos += l + 1;

    if (checkSC(pos)) uri = uri.concat(getSC());
  }

  t = tokens[startPos];
  const line = t.ln;
  const column = t.col;
  const end = getLastPosition(uri, line, column, 1);
  pos++;

  return newNode(NodeType.UriType, uri, line, column, end);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkUri1(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].type !== TokenType.StringDQ &&
      tokens[i].type !== TokenType.StringSQ) return 0;

  i++;

  if (l = checkSC(i)) i += l;

  return i - start;
}

/**
 * Check if token is part of a value
 * @param {Number} i Token's index number
 * @return {Number} Length of the value
 */
function checkValue(i) {
  const start = i;
  let l;
  let s;
  let _i;

  while (i < tokensLength) {
    s = checkSC(i);
    _i = i + s;

    if (l = _checkValue(_i)) i += l + s;
    else break;
  }

  tokens[start].value_end = i;

  return i - start;
}

/**
 * @return {Array}
 */
function getValue() {
  const type = NodeType.ValueType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const end = tokens[pos].value_end;
  let content = [];

  while (pos < end) {
    if (tokens[pos].value_child) content.push(_getValue());
    else content = content.concat(getSC());
  }

  return newNode(type, content, line, column);
}

/**
 * @param {Number} i Token's index number
 * @return {Number}
 */
function _checkValue(i) {
  let l;

  if (l = checkProgid(i)) tokens[i].value_child = 1;
  else if (l = checkVhash(i)) tokens[i].value_child = 2;
  else if (l = checkAny(i)) tokens[i].value_child = 3;
  else if (l = checkOperator(i)) tokens[i].value_child = 4;
  else if (l = checkImportant(i)) tokens[i].value_child = 5;

  return l;
}

/**
 * @return {Array}
 */
function _getValue() {
  const childType = tokens[pos].value_child;
  if (childType === 1) return getProgid();
  if (childType === 2) return getVhash();
  if (childType === 3) return getAny();
  if (childType === 4) return getOperator();
  if (childType === 5) return getImportant();
}

/**
 * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
 *      some value
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkVhash(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  // Skip `#`.
  if (tokens[i].type === TokenType.NumberSign) i++;
  else return 0;

  if (l = checkNmName2(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a hexadecimal number (e.g. `#fff`) inside some value
 * @return {Array} `['vhash', x]` where `x` is a hexadecimal number
 *      converted to string (without `#`, e.g. `'fff'`).
 */
function getVhash() {
  const type = NodeType.VhashType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;

  // Skip `#`.
  pos++;

  const content = getNmName2();
  const end = getLastPosition(content, line, column + 1);
  return newNode(type, content, line, column, end);
}

function checkSelectorsGroup(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  let l;
  let selectorCounter = 0;
  let delimCounter = 0;

  if (l = checkSelector(i)) {
    i += l;
    selectorCounter++;
  } else return 0;

  while (i < tokensLength) {
    const tempStart = i;
    let tempIndex = i;
    let tempLength;

    let spaceBefore = checkSC(tempIndex);

    if (tempLength = checkDelim(tempIndex + spaceBefore)) {
      tempIndex += spaceBefore + tempLength;
      delimCounter++;

      if (tempLength = checkSC(tempIndex)) tempIndex += tempLength;
      if (tempLength = checkSelector(tempIndex)) {
        tempIndex += tempLength;
        selectorCounter++;
      }
    }
    else break;

    i += tempIndex - tempStart;
  }

  tokens[start].selectorsGroupEnd = i;
  tokens[start].selectorsGroupSelectorCount = selectorCounter;
  tokens[start].selectorsGroupDelimCount = delimCounter;

  return i - start;
}

function getSelectorsGroup() {
  let selectorsGroup = [];
  let selectorCounter = 0;
  let delimCounter = 0;

  const selectorsGroupEnd = tokens[pos].selectorsGroupEnd;
  const selectorCount = tokens[pos].selectorsGroupSelectorCount;
  const delimCount = tokens[pos].selectorsGroupDelimCount;

  selectorsGroup.push(getSelector());
  selectorCounter++;

  while (pos < selectorsGroupEnd) {
    if (delimCounter < delimCount) {
      selectorsGroup = selectorsGroup.concat(getSC());
      selectorsGroup = selectorsGroup.concat(getDelim());
      delimCounter++;

      selectorsGroup = selectorsGroup.concat(getSC());

      if (selectorCounter < selectorCount) {
        selectorsGroup = selectorsGroup.concat(getSelector());
        selectorCounter++;
      }
    }
  }

  return selectorsGroup;
}

function checkSelector(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  let l;

  if (l = checkCompoundSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    const spaceBefore = checkSC(i);
    const comma = checkCombinator(i + spaceBefore);
    if (!spaceBefore && !comma) break;

    const spaceAfter = checkSC(i + spaceBefore + comma);
    if (l = checkCompoundSelector(i + spaceBefore + comma + spaceAfter)) {
      i += spaceBefore + comma + spaceAfter + l;
    } else break;
  }

  tokens[start].selectorEnd = i;
  return i - start;
}

function getSelector() {
  const type = NodeType.SelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const selectorEnd = token.selectorEnd;
  let content = getCompoundSelector();

  while (pos < selectorEnd) {
    content = content.concat(getSC());
    if (checkCombinator(pos)) content.push(getCombinator());
    content = content.concat(
      getSC(),
      getCompoundSelector()
    );
  }

  return newNode(type, content, line, column);
}

function checkCompoundSelector(i) {
  let l;

  if (l = checkCompoundSelector1(i)) {
    tokens[i].compoundSelectorType = 1;
  } else if (l = checkCompoundSelector2(i)) {
    tokens[i].compoundSelectorType = 2;
  }

  return l;
}

function getCompoundSelector() {
  const type = tokens[pos].compoundSelectorType;
  if (type === 1) return getCompoundSelector1();
  if (type === 2) return getCompoundSelector2();
}

function checkCompoundSelector1(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  let l;

  if (l = checkUniversalSelector(i) || checkTypeSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    const l = checkShash(i) ||
        checkClass(i) ||
        checkAttributeSelector(i) ||
        checkPseudo(i);
    if (l) i += l;
    else break;
  }

  tokens[start].compoundSelectorEnd = i;

  return i - start;
}

function getCompoundSelector1() {
  const sequence = [];
  const compoundSelectorEnd = tokens[pos].compoundSelectorEnd;

  if (checkUniversalSelector(pos)) sequence.push(getUniversalSelector());
  else sequence.push(getTypeSelector());

  while (pos < compoundSelectorEnd) {
    if (checkShash(pos)) sequence.push(getShash());
    else if (checkClass(pos)) sequence.push(getClass());
    else if (checkAttributeSelector(pos)) sequence.push(getAttributeSelector());
    else if (checkPseudo(pos)) sequence.push(getPseudo());
  }

  return sequence;
}

function checkCompoundSelector2(i) {
  if (i >= tokensLength) return 0;

  const start = i;

  while (i < tokensLength) {
    const l = checkShash(i) ||
        checkClass(i) ||
        checkAttributeSelector(i) ||
        checkPseudo(i);

    if (l) i += l;
    else break;
  }

  tokens[start].compoundSelectorEnd = i;

  return i - start;
}

function getCompoundSelector2() {
  const sequence = [];
  const compoundSelectorEnd = tokens[pos].compoundSelectorEnd;

  while (pos < compoundSelectorEnd) {
    if (checkShash(pos)) sequence.push(getShash());
    else if (checkClass(pos)) sequence.push(getClass());
    else if (checkAttributeSelector(pos)) sequence.push(getAttributeSelector());
    else if (checkPseudo(pos)) sequence.push(getPseudo());
    else break;
  }

  return sequence;
}

function checkUniversalSelector(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  let l;

  if (l = checkNamePrefix(i)) i += l;

  if (tokens[i].type === TokenType.Asterisk) i++;
  else return 0;

  return i - start;
}

function getUniversalSelector() {
  const type = NodeType.UniversalSelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];
  let end;

  if (checkNamePrefix(pos)) {
    content.push(getNamePrefix());
    end = getLastPosition(content, line, column, 1);
  }

  pos++;

  return newNode(type, content, line, column, end);
}

function checkTypeSelector(i) {
  if (i >= tokensLength) return 0;

  const start = i;
  let l;

  if (l = checkNamePrefix(i)) i += l;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

function getTypeSelector() {
  const type = NodeType.TypeSelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  if (checkNamePrefix(pos)) content.push(getNamePrefix());

  content.push(getIdent());

  return newNode(type, content, line, column);
}

function checkAttributeSelector(i) {
  let l;
  if (l = checkAttributeSelector1(i)) tokens[i].attributeSelectorType = 1;
  else if (l = checkAttributeSelector2(i)) tokens[i].attributeSelectorType = 2;

  return l;
}

function getAttributeSelector() {
  const type = tokens[pos].attributeSelectorType;
  if (type === 1) return getAttributeSelector1();
  else return getAttributeSelector2();
}

/**
 * (1) `[panda=nani]`
 * (2) `[panda='nani']`
 * (3) `[panda='nani' i]`
 *
 */
function checkAttributeSelector1(i) {
  const start = i;

  if (tokens[i].type === TokenType.LeftSquareBracket) i++;
  else return 0;

  let l;
  if (l = checkSC(i)) i += l;

  if (l = checkAttributeName(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkAttributeMatch(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkAttributeValue(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkAttributeFlags(i)) {
    i += l;
    if (l = checkSC(i)) i += l;
  }

  if (tokens[i].type === TokenType.RightSquareBracket) i++;
  else return 0;

  return i - start;
}

function getAttributeSelector1() {
  const type = NodeType.AttributeSelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  // Skip `[`.
  pos++;

  content = content.concat(
    getSC(),
    getAttributeName(),
    getSC(),
    getAttributeMatch(),
    getSC(),
    getAttributeValue(),
    getSC()
  );

  if (checkAttributeFlags(pos)) {
    content.push(getAttributeFlags());
    content = content.concat(getSC());
  }

  // Skip `]`.
  pos++;

  const end = getLastPosition(content, line, column, 1);
  return newNode(type, content, line, column, end);
}

/**
 * (1) `[panda]`
 */
function checkAttributeSelector2(i) {
  const start = i;

  if (tokens[i].type === TokenType.LeftSquareBracket) i++;
  else return 0;

  let l;
  if (l = checkSC(i)) i += l;

  if (l = checkAttributeName(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].type === TokenType.RightSquareBracket) i++;
  else return 0;

  return i - start;
}

function getAttributeSelector2() {
  const type = NodeType.AttributeSelectorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  // Skip `[`.
  pos++;

  content = content.concat(
    getSC(),
    getAttributeName(),
    getSC()
  );

  // Skip `]`.
  pos++;

  const end = getLastPosition(content, line, column, 1);
  return newNode(type, content, line, column, end);
}

function checkAttributeName(i) {
  const start = i;
  let l;

  if (l = checkNamePrefix(i)) i += l;

  if (l = checkIdent(i)) i += l;
  else return 0;

  return i - start;
}

function getAttributeName() {
  const type = NodeType.AttributeNameType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  if (checkNamePrefix(pos)) content.push(getNamePrefix());
  content.push(getIdent());

  return newNode(type, content, line, column);
}

function checkAttributeMatch(i) {
  let l;
  if (l = checkAttributeMatch1(i)) tokens[i].attributeMatchType = 1;
  else if (l = checkAttributeMatch2(i)) tokens[i].attributeMatchType = 2;

  return l;
}

function getAttributeMatch() {
  const type = tokens[pos].attributeMatchType;
  if (type === 1) return getAttributeMatch1();
  else return getAttributeMatch2();
}

function checkAttributeMatch1(i) {
  const start = i;

  const type = tokens[i].type;
  if (type === TokenType.Tilde ||
      type === TokenType.VerticalLine ||
      type === TokenType.CircumflexAccent ||
      type === TokenType.DollarSign ||
      type === TokenType.Asterisk) i++;
  else return 0;

  if (tokens[i].type === TokenType.EqualsSign) i++;
  else return 0;

  return i - start;
}

function getAttributeMatch1() {
  const type = NodeType.AttributeMatchType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = tokens[pos].value + tokens[pos + 1].value;
  pos += 2;

  return newNode(type, content, line, column);
}

function checkAttributeMatch2(i) {
  if (tokens[i].type === TokenType.EqualsSign) return 1;
  else return 0;
}

function getAttributeMatch2() {
  const type = NodeType.AttributeMatchType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = '=';

  pos++;
  return newNode(type, content, line, column);
}

function checkAttributeValue(i) {
  return checkString(i) || checkIdent(i);
}

function getAttributeValue() {
  const type = NodeType.AttributeValueType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  if (checkString(pos)) content.push(getString());
  else content.push(getIdent());

  return newNode(type, content, line, column);
}

function checkAttributeFlags(i) {
  return checkIdent(i);
}

function getAttributeFlags() {
  const type = NodeType.AttributeFlagsType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [getIdent()];

  return newNode(type, content, line, column);
}

function checkNamePrefix(i) {
  if (i >= tokensLength) return 0;

  let l;
  if (l = checkNamePrefix1(i)) tokens[i].namePrefixType = 1;
  else if (l = checkNamePrefix2(i)) tokens[i].namePrefixType = 2;

  return l;
}

function getNamePrefix() {
  const type = tokens[pos].namePrefixType;
  if (type === 1) return getNamePrefix1();
  else return getNamePrefix2();
}

/**
 * (1) `panda|`
 * (2) `panda<comment>|`
 */
function checkNamePrefix1(i) {
  const start = i;
  let l;

  if (l = checkNamespacePrefix(i)) i += l;
  else return 0;

  if (l = checkCommentML(i)) i += l;

  if (l = checkNamespaceSeparator(i)) i += l;
  else return 0;

  return i - start;
}

function getNamePrefix1() {
  const type = NodeType.NamePrefixType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  content.push(getNamespacePrefix());

  if (checkCommentML(pos)) content.push(getCommentML());

  content.push(getNamespaceSeparator());

  return newNode(type, content, line, column);
}

/**
 * (1) `|`
 */
function checkNamePrefix2(i) {
  return checkNamespaceSeparator(i);
}

function getNamePrefix2() {
  const type = NodeType.NamePrefixType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [getNamespaceSeparator()];

  return newNode(type, content, line, column);
}

/**
 * (1) `*`
 * (2) `panda`
 */
function checkNamespacePrefix(i) {
  if (i >= tokensLength) return 0;

  let l;

  if (tokens[i].type === TokenType.Asterisk) return 1;
  else if (l = checkIdent(i)) return l;
  else return 0;
}

function getNamespacePrefix() {
  const type = NodeType.NamespacePrefixType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = [];

  if (token.type === TokenType.Asterisk) {
    const asteriskNode = newNode(NodeType.IdentType, '*', line, column);
    content.push(asteriskNode);
    pos++;
  } else if (checkIdent(pos)) content.push(getIdent());

  return newNode(type, content, line, column);
}

/**
 * (1) `|`
 */
function checkNamespaceSeparator(i) {
  if (i >= tokensLength) return 0;

  if (tokens[i].type !== TokenType.VerticalLine) return 0;

  // Return false if `|=` - [attr|=value]
  if (tokens[i + 1] && tokens[i + 1].type === TokenType.EqualsSign) return 0;

  return 1;
}

function getNamespaceSeparator() {
  const type = NodeType.NamespaceSeparatorType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  const content = '|';

  pos++;
  return newNode(type, content, line, column);
}

module.exports = function(_tokens, context) {
  tokens = _tokens;
  tokensLength = tokens.length;
  pos = 0;

  return contexts[context]();
};
