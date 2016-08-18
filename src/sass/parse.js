'use strict';

const Node = require('../node/basic-node');
const NodeType = require('../node/node-types');
const TokenType = require('../token-types');

let tokens;
let tokensLength;
let pos;

const contexts = {
  'arguments': () => {
    return checkArguments(pos) && getArguments();
  },
  'atkeyword': () => {
    return checkAtkeyword(pos) && getAtkeyword();
  },
  'atrule': () => {
    return checkAtrule(pos) && getAtrule();
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
  'commentSL': () => {
    return checkCommentSL(pos) && getCommentSL();
  },
  'condition': () => {
    return checkCondition(pos) && getCondition();
  },
  'conditionalStatement': () => {
    return checkConditionalStatement(pos) && getConditionalStatement();
  },
  'declaration': () => {
    return checkDeclaration(pos) && getDeclaration();
  },
  'declDelim': () => {
    return checkDeclDelim(pos) && getDeclDelim();
  },
  'default': () => {
    return checkDefault(pos) && getDefault();
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
  'extend': () => {
    return checkExtend(pos) && getExtend();
  },
  'function': () => {
    return checkFunction(pos) && getFunction();
  },
  'global': () => {
    return checkGlobal(pos) && getGlobal();
  },
  'ident': () => {
    return checkIdent(pos) && getIdent();
  },
  'important': () => {
    return checkImportant(pos) && getImportant();
  },
  'include': () => {
    return checkInclude(pos) && getInclude();
  },
  'interpolation': () => {
    return checkInterpolation(pos) && getInterpolation();
  },
  'loop': () => {
    return checkLoop(pos) && getLoop();
  },
  'mixin': () => {
    return checkMixin(pos) && getMixin();
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
  'optional': () => {
    return checkOptional(pos) && getOptional();
  },
  'parentheses': () => {
    return checkParentheses(pos) && getParentheses();
  },
  'parentselector': () => {
    return checkParentSelector(pos) && getParentSelector();
  },
  'percentage': () => {
    return checkPercentage(pos) && getPercentage();
  },
  'placeholder': () => {
    return checkPlaceholder(pos) && getPlaceholder();
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
  'urange': () => {
    return checkUrange(pos) && getUrange();
  },
  'uri': () => {
    return checkUri(pos) && getUri();
  },
  'value': () => {
    return checkValue(pos) && getValue();
  },
  'variable': () => {
    return checkVariable(pos) && getVariable();
  },
  'variableslist': () => {
    return checkVariablesList(pos) && getVariablesList();
  },
  'vhash': () => {
    return checkVhash(pos) && getVhash();
  }
};

/**
 * Stops parsing and display error.
 *
 * @param {number=} opt_i Token's index number
 */
function throwError(opt_i) {
  var ln = opt_i ? tokens[opt_i].ln : tokens[pos].ln;

  throw {line: ln, syntax: 'sass'};
}

/**
 * @param {!Object} exclude
 * @param {number} i Token's index number
 * @return {number}
 */
function checkExcluding(exclude, i) {
  var start = i;

  while (i < tokensLength) {
    if (exclude[tokens[i++].type]) break;
  }

  return i - start - 2;
}

/**
 * @param {number} start
 * @param {number} finish
 * @return {string}
 */
function joinValues(start, finish) {
  var s = '';

  for (var i = start; i < finish + 1; i++) {
    s += tokens[i].value;
  }

  return s;
}

/**
 * @param {number} start
 * @param {number} num
 * @return {string}
 */
function joinValues2(start, num) {
  if (start + num - 1 >= tokensLength) return;

  var s = '';

  for (var i = 0; i < num; i++) {
    s += tokens[start + i].value;
  }

  return s;
}

/**
 * @param {string|!Array} content
 * @param {number} line
 * @param {number} column
 * @param {number} colOffset
 */
function getLastPosition(content, line, column, colOffset) {
  return typeof content === 'string' ?
      getLastPositionForString(content, line, column, colOffset) :
      getLastPositionForArray(content, line, column, colOffset);
}

/**
 * @param {string} content
 * @param {number} line
 * @param {number} column
 * @param {number} colOffset
 */
function getLastPositionForString(content, line, column, colOffset) {
  var position = [];

  if (!content) {
    position = [line, column];
    if (colOffset) position[1] += colOffset - 1;
    return position;
  }

  var lastLinebreak = content.lastIndexOf('\n');
  var endsWithLinebreak = lastLinebreak === content.length - 1;
  var splitContent = content.split('\n');
  var linebreaksCount = splitContent.length - 1;
  var prevLinebreak = linebreaksCount === 0 || linebreaksCount === 1 ?
      -1 : content.length - splitContent[linebreaksCount - 1].length - 2;

  // Line:
  var offset = endsWithLinebreak ? linebreaksCount - 1 : linebreaksCount;
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

/**
 * @param {!Array} content
 * @param {number} line
 * @param {number} column
 * @param {number} colOffset
 */
function getLastPositionForArray(content, line, column, colOffset) {
  var position;

  if (content.length === 0) {
    position = [line, column];
  } else {
    var c = content[content.length - 1];
    if (c.hasOwnProperty('end')) {
      position = [c.end.line, c.end.column];
    } else {
      position = getLastPosition(c.content, line, column);
    }
  }

  if (!colOffset) return position;

  if (tokens[pos - 1].type !== 'Newline') {
    position[1] += colOffset;
  } else {
    position[0]++;
    position[1] = 1;
  }

  return position;
}

/**
 * @param {string} type
 * @param {string|!Array} content
 * @param {number} line
 * @param {number} column
 * @param {!Array} end
 */
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
    syntax: 'sass'
  });
}



/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkAny(i) {
  var l;

  if (l = checkBrackets(i)) tokens[i].any_child = 1;
  else if (l = checkParentheses(i)) tokens[i].any_child = 2;
  else if (l = checkString(i)) tokens[i].any_child = 3;
  else if (l = checkVariablesList(i)) tokens[i].any_child = 4;
  else if (l = checkVariable(i)) tokens[i].any_child = 5;
  else if (l = checkPlaceholder(i)) tokens[i].any_child = 6;
  else if (l = checkPercentage(i)) tokens[i].any_child = 7;
  else if (l = checkDimension(i)) tokens[i].any_child = 8;
  else if (l = checkUnicodeRange(i)) tokens[i].any_child = 17;
  else if (l = checkNumber(i)) tokens[i].any_child = 9;
  else if (l = checkUri(i)) tokens[i].any_child = 10;
  else if (l = checkExpression(i)) tokens[i].any_child = 11;
  else if (l = checkFunction(i)) tokens[i].any_child = 12;
  else if (l = checkInterpolation(i)) tokens[i].any_child = 13;
  else if (l = checkIdent(i)) tokens[i].any_child = 14;
  else if (l = checkClass(i)) tokens[i].any_child = 15;
  else if (l = checkUnary(i)) tokens[i].any_child = 16;

  return l;
}

/**
 * @return {!Node}
 */
function getAny() {
  var childType = tokens[pos].any_child;

  if (childType === 1) return getBrackets();
  else if (childType === 2) return getParentheses();
  else if (childType === 3) return getString();
  else if (childType === 4) return getVariablesList();
  else if (childType === 5) return getVariable();
  else if (childType === 6) return getPlaceholder();
  else if (childType === 7) return getPercentage();
  else if (childType === 8) return getDimension();
  else if (childType === 17) return getUnicodeRange();
  else if (childType === 9) return getNumber();
  else if (childType === 10) return getUri();
  else if (childType === 11) return getExpression();
  else if (childType === 12) return getFunction();
  else if (childType === 13) return getInterpolation();
  else if (childType === 14) return getIdent();
  else if (childType === 15) return getClass();
  else if (childType === 16) return getUnary();
}

/**
 * Checks if token is part of mixin's arguments.
 *
 * @param {number} i Token's index number
 * @return {number} Length of arguments
 */
function checkArguments(i) {
  let start = i;
  let l;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  i++;

  while (i < tokens[start].right) {
    if (l = checkArgument(i)) i += l;
    else return 0;
  }

  return tokens[start].right - start + 1;
}

/**
 * Checks if token is valid to be part of arguments list
 *
 * @param {number} i Token's index number
 * @return {number} Length of argument
 */
function checkArgument(i) {
  var l;

  if (l = checkBrackets(i)) tokens[i].argument_child = 1;
  else if (l = checkParentheses(i)) tokens[i].argument_child = 2;
  else if (l = checkDeclaration(i)) tokens[i].argument_child = 3;
  else if (l = checkFunction(i)) tokens[i].argument_child = 4;
  else if (l = checkVariablesList(i)) tokens[i].argument_child = 5;
  else if (l = checkVariable(i)) tokens[i].argument_child = 6;
  else if (l = checkSC(i)) tokens[i].argument_child = 7;
  else if (l = checkDelim(i)) tokens[i].argument_child = 8;
  else if (l = checkDeclDelim(i)) tokens[i].argument_child = 9;
  else if (l = checkString(i)) tokens[i].argument_child = 10;
  else if (l = checkPercentage(i)) tokens[i].argument_child = 11;
  else if (l = checkDimension(i)) tokens[i].argument_child = 12;
  else if (l = checkNumber(i)) tokens[i].argument_child = 13;
  else if (l = checkUri(i)) tokens[i].argument_child = 14;
  else if (l = checkInterpolation(i)) tokens[i].argument_child = 15;
  else if (l = checkIdent(i)) tokens[i].argument_child = 16;
  else if (l = checkVhash(i)) tokens[i].argument_child = 17;
  else if (l = checkOperator(i)) tokens[i].argument_child = 18;
  else if (l = checkUnary(i)) tokens[i].argument_child = 19;
  else if (l = checkParentSelector(i)) tokens[i].argument_child = 20;

  return l;
}

/**
 * @return {!Node}
 */
function getArgument() {
  var childType = tokens[pos].argument_child;

  if (childType === 1) return getBrackets();
  else if (childType === 2) return getParentheses();
  else if (childType === 3) return getDeclaration();
  else if (childType === 4) return getFunction();
  else if (childType === 5) return getVariablesList();
  else if (childType === 6) return getVariable();
  else if (childType === 7) return getSC();
  else if (childType === 8) return getDelim();
  else if (childType === 9) return getDeclDelim();
  else if (childType === 10) return getString();
  else if (childType === 11) return getPercentage();
  else if (childType === 12) return getDimension();
  else if (childType === 13) return getNumber();
  else if (childType === 14) return getUri();
  else if (childType === 15) return getInterpolation();
  else if (childType === 16) return getIdent();
  else if (childType === 17) return getVhash();
  else if (childType === 18) return getOperator();
  else if (childType === 19) return getUnary();
  else if (childType === 20) return getParentSelector();
}

/**
 * Checks if token is part of an @-word (e.g. `@import`, `@include`).
 *
 * @param {number} i Token's index number
 * @return {number}
 */
function checkAtkeyword(i) {
  var l;

  // Check that token is `@`:
  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.CommercialAt) return 0;

  return (l = checkIdentOrInterpolation(i)) ? l + 1 : 0;
}

/**
 * Gets node with @-word.
 *
 * @return {!Node}
 */
function getAtkeyword() {
  let startPos = pos++;
  let x = getIdentOrInterpolation();

  var token = tokens[startPos];
  return newNode(NodeType.AtkeywordType, x, token.ln, token.col);
}

/**
 * Checks if token is a part of an @-rule.
 *
 * @param {number} i Token's index number
 * @return {number} Length of @-rule
 */
function checkAtrule(i) {
  var l;

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
 * Gets node with @-rule.
 *
 * @return {!Node}
 */
function getAtrule() {
  switch (tokens[pos].atrule_type) {
    case 1: return getAtruler(); // @-rule with ruleset
    case 2: return getAtruleb(); // Block @-rule
    case 3: return getAtrules(); // Single-line @-rule
    case 4: return getKeyframesRule();
  }
}

/**
 * Checks if token is part of a block @-rule.
 *
 * @param {number} i Token's index number
 * @return {number} Length of the @-rule
 */
function checkAtruleb(i) {
  let start = i;
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
 * Gets node with a block @-rule.
 *
 * @return {!Node}
 */
function getAtruleb() {
  let startPos = pos;
  let x;

  x = [getAtkeyword()]
      .concat(getTsets())
      .concat([getBlock()]);

  var token = tokens[startPos];
  return newNode(NodeType.AtruleType, x, token.ln, token.col);
}

/**
 * Checks if token is part of an @-rule with ruleset.
 *
 * @param {number} i Token's index number
 * @return {number} Length of the @-rule
 */
function checkAtruler(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (l = checkTsets(i)) i += l;

  if (l = checkAtrulers(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Gets node with an @-rule with ruleset.
 *
 * @return {!Node}
 */
function getAtruler() {
  let startPos = pos;
  let x;

  x = [getAtkeyword()].concat(getTsets());

  x.push(getAtrulers());

  var token = tokens[startPos];
  return newNode(NodeType.AtruleType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkAtrulers(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;
  if (!tokens[i].block_end) return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkRuleset(i) || checkAtrule(i)) i += l;
  else return 0;

  while (l = checkRuleset(i) || checkAtrule(i) || checkSC(i)) {
    i += l;
  }

  if (i < tokensLength) tokens[i].atrulers_end = 1;

  return i - start;
}

/**
 * @return {!Node}
 */
function getAtrulers() {
  var startPos = pos;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;
  var x = getSC();

  while (pos < tokensLength && !tokens[pos].atrulers_end) {
    if (checkSC(pos)) x = x.concat(getSC());
    else if (checkAtrule(pos)) x.push(getAtrule());
    else if (checkRuleset(pos)) x.push(getRuleset());
  }

  var end = getLastPosition(x, line, column);

  return newNode(NodeType.BlockType, x, token.ln, token.col, end);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkAtrules(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (l = checkTsets(i)) i += l;

  return i - start;
}

/**
 * @return {!Node}
 */
function getAtrules() {
  let startPos = pos;
  let x;

  x = [getAtkeyword()].concat(getTsets());

  var token = tokens[startPos];
  return newNode(NodeType.AtruleType, x, token.ln, token.col);
}

/**
 * Checks if token is part of a block (e.g. `{...}`).
 *
 * @param {number} i Token's index number
 * @return {number} Length of the block
 */
function checkBlock(i) {
  return i < tokensLength && tokens[i].block_end ?
      tokens[i].block_end - i + 1 : 0;
}

/**
 * Gets node with a block.
 *
 * @return {!Node}
 */
function getBlock() {
  let startPos = pos;
  let end = tokens[pos].block_end;
  let x = [];
  var token = tokens[startPos];

  while (pos < end) {
    if (checkBlockdecl(pos)) x = x.concat(getBlockdecl());
    else throwError();
  }

  return newNode(NodeType.BlockType, x, token.ln, token.col);
}

/**
 * Checks if token is part of a declaration (property-value pair).
 *
 * @param {number} i Token's index number
 * @return {number} Length of the declaration
 */
function checkBlockdecl(i) {
  var l;

  if (i >= tokensLength) return 0;

  if (l = checkBlockdecl7(i)) tokens[i].bd_type = 7;
  else if (l = checkBlockdecl5(i)) tokens[i].bd_type = 5;
  else if (l = checkBlockdecl6(i)) tokens[i].bd_type = 6;
  else if (l = checkBlockdecl1(i)) tokens[i].bd_type = 1;
  else if (l = checkBlockdecl2(i)) tokens[i].bd_type = 2;
  else if (l = checkBlockdecl3(i)) tokens[i].bd_type = 3;
  else if (l = checkBlockdecl4(i)) tokens[i].bd_type = 4;
  else return 0;

  return l;
}

/**
 * @return {!Array}
 */
function getBlockdecl() {
  switch (tokens[pos].bd_type) {
    case 1: return getBlockdecl1();
    case 2: return getBlockdecl2();
    case 3: return getBlockdecl3();
    case 4: return getBlockdecl4();
    case 5: return getBlockdecl5();
    case 6: return getBlockdecl6();
    case 7: return getBlockdecl7();
  }
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl1(i) {
  let start = i;
  let l;

  if (l = checkInclude(i)) tokens[i].bd_kind = 2;
  else if (l = checkDeclaration(i)) tokens[i].bd_kind = 5;
  else if (l = checkAtrule(i)) tokens[i].bd_kind = 6;
  else return 0;

  i += l;

  if (tokens[start].bd_kind === 2 &&
      [2, 4, 6, 8].indexOf(tokens[start].include_type) === -1) return 0;

  if (tokens[start].bd_kind === 6 &&
      tokens[start].atrule_type === 3) return 0;

  while (i < tokensLength) {
    if (l = checkDeclDelim(i))
        return i + l - start;

    if (l = checkS(i)) i += l;
    else if (l = checkCommentSL(i)) i += l;
    else break;
  }

  return 0;
}

/**
 * @return {!Array}
 */
function getBlockdecl1() {
  let x = [];
  let _x = [];
  let kind = tokens[pos].bd_kind;

  switch (kind) {
    case 2:
      x.push(getInclude());
      break;
    case 5:
      x.push(getDeclaration());
      break;
    case 6:
      x.push(getAtrule());
      break;
  }

  while (pos < tokensLength) {
    let _pos = pos;
    if (checkDeclDelim(pos)) {
      _x.push(getDeclDelim());
      x = x.concat(_x);
      break;
    }

    if (checkS(pos)) _x.push(getS());
    else if (checkCommentSL(pos)) _x.push(getCommentSL());
    else {
      pos = _pos;
      break;
    }
  }

  return x;
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl2(i) {
  let start = i;
  let l;

  if (l = checkConditionalStatement(i)) tokens[i].bd_kind = 1;
  else if (l = checkInclude(i)) tokens[i].bd_kind = 2;
  else if (l = checkExtend(i)) tokens[i].bd_kind = 4;
  else if (l = checkMixin(i)) tokens[i].bd_kind = 8;
  else if (l = checkLoop(i)) tokens[i].bd_kind = 3;
  else if (l = checkRuleset(i)) tokens[i].bd_kind = 7;
  else if (l = checkDeclaration(i)) tokens[i].bd_kind = 5;
  else if (l = checkAtrule(i)) tokens[i].bd_kind = 6;
  else return 0;

  i += l;

  while (i < tokensLength) {
    if (l = checkS(i)) i += l;
    else if (l = checkCommentSL(i)) i += l;
    else break;
  }

  return i - start;
}

/**
 * @return {!Array}
 */
function getBlockdecl2() {
  let x = [];

  switch (tokens[pos].bd_kind) {
    case 1:
      x.push(getConditionalStatement());
      break;
    case 2:
      x.push(getInclude());
      break;
    case 3:
      x.push(getLoop());
      break;
    case 4:
      x.push(getExtend());
      break;
    case 5:
      x.push(getDeclaration());
      break;
    case 6:
      x.push(getAtrule());
      break;
    case 7:
      x.push(getRuleset());
      break;
    case 8:
      x.push(getMixin());
      break;
  }

  while (pos < tokensLength) {
    if (checkS(pos)) x.push(getS());
    else if (checkCommentSL(pos)) x.push(getCommentSL());
    else break;
  }

  return x;
}



/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl3(i) {
  let start = i;
  let l;

  if (l = checkConditionalStatement(i)) tokens[i].bd_kind = 1;
  else if (l = checkInclude(i)) tokens[i].bd_kind = 2;
  else if (l = checkExtend(i)) tokens[i].bd_kind = 4;
  else if (l = checkLoop(i)) tokens[i].bd_kind = 3;
  else if (l = checkRuleset(i)) tokens[i].bd_kind = 7;
  else if (l = checkDeclaration(i)) tokens[i].bd_kind = 5;
  else if (l = checkAtrule(i)) tokens[i].bd_kind = 6;
  else return 0;

  i += l;

  return i - start;
}

/**
 * @return {!Array}
 */
function getBlockdecl3() {
  let x;

  switch (tokens[pos].bd_kind) {
    case 1:
      x = getConditionalStatement();
      break;
    case 2:
      x = getInclude();
      break;
    case 3:
      x = getLoop();
      break;
    case 4:
      x = getExtend();
      break;
    case 5:
      x = getDeclaration();
      break;
    case 6:
      x = getAtrule();
      break;
    case 7:
      x = getRuleset();
      break;
  }

  return [x];
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl4(i) {
  return checkSC(i);
}

/**
 * @return {!Array}
 */
function getBlockdecl4() {
  return getSC();
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl5(i) {
  let start = i;
  let l;

  if (l = checkInclude(i)) i += l;
  else if (l = checkRuleset(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    if (l = checkS(i)) i += l;
    else if (l = checkCommentSL(i)) i += l;
    else break;
  }

  return i - start;
}

/**
 * @return {!Array}
 */
function getBlockdecl5() {
  let x = [];

  if (checkInclude(pos)) x.push(getInclude());
  else x.push(getRuleset());

  while (pos < tokensLength) {
    if (checkS(pos)) x.push(getS());
    else if (checkCommentSL(pos)) x.push(getCommentSL());
    else break;
  }

  return x;
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl6(i) {
  let start = i;
  let l;

  if (l = checkInclude(i)) i += l;
  else if (l = checkRuleset(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {!Array}
 */
function getBlockdecl6() {
  let x;

  if (checkInclude(pos)) x = getInclude();
  else x = getRuleset();

  return [x];
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBlockdecl7(i) {
  let start = i;
  let l;

  if (l = checkInclude(i)) i += l;
  else return 0;

  if ([2, 4, 6, 8].indexOf(tokens[start].include_type) === -1) return 0;

  while (i < tokensLength) {
    if (l = checkDeclDelim(i))
        return i + l - start;

    if (l = checkS(i)) i += l;
    else if (l = checkCommentSL(i)) i += l;
    else break;
  }

  return 0;
}

/**
 * @return {!Array}
 */
function getBlockdecl7() {
  let x = [];
  let _x = [];

  x.push(getInclude());

  while (pos < tokensLength) {
    let _pos = pos;
    if (checkDeclDelim(pos)) {
      _x.push(getDeclDelim());
      x = x.concat(_x);
      break;
    }

    if (checkS(pos)) _x.push(getS());
    else if (checkCommentSL(pos)) _x.push(getCommentSL());
    else {
      pos = _pos;
      break;
    }
  }

  return x;
}


/**
 * Checks if token is part of text inside square brackets, e.g. `[1]`.
 *
 * @param {number} i Token's index number
 * @return {number}
 */
function checkBrackets(i) {
  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftSquareBracket) return 0;

  return tokens[i].right - i + 1;
}

/**
 * Gets node with text inside square brackets, e.g. `[1]`.
 *
 * @return {!Node}
 */
function getBrackets() {
  var startPos = pos;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  pos++;

  var tsets = getTsets();

  var end = getLastPosition(tsets, line, column, 1);
  pos++;

  return newNode(NodeType.BracketsType, tsets, token.ln, token.col, end);
}

/**
 * Checks if token is part of a class selector (e.g. `.abc`).
 *
 * @param {number} i Token's index number
 * @return {number} Length of the class selector
 */
function checkClass(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].class_l) return tokens[i].class_l;

  if (tokens[i++].type !== TokenType.FullStop) return 0;

  // Check for `-` at beginning
  if (tokens[i].type === TokenType.HyphenMinus) i += 1;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    if (l = checkIdentOrInterpolation(i) || checkNumber(i)) i += l;
    else if (tokens[i].type === TokenType.HyphenMinus) i += 1;
    else break;
  }

  tokens[start].classEnd = i;

  return i - start;
}

/**
 * Gets node with a class selector.
 *
 * @return {!Node}
 */
function getClass() {
  let startPos = pos;
  let type = NodeType.ClassType;
  let token = tokens[startPos];
  let line = token.ln;
  let column = token.col;
  let content = [];
  let end = token.classEnd;

  // Skip `.`
  pos++;

  while (pos < end) {
    if (checkIdentOrInterpolation(pos)) {
      content = content.concat(getIdentOrInterpolation());
    } else if (checkNumber(pos)) {
      content = content.concat(getNumber());
    } else if (tokens[pos].type === TokenType.HyphenMinus) {
      content.push(
        newNode(
          NodeType.IdentType,
          tokens[pos].value,
          tokens[pos].ln,
          tokens[pos].col
        )
      );
      pos++;
    } else break;
  }

  return newNode(type, content, line, column);
}

/**
 * @param {number} i
 * @return {number}
 */
function checkCombinator(i) {
  if (i >= tokensLength) return 0;

  let l;
  if (l = checkCombinator1(i)) tokens[i].combinatorType = 1;
  else if (l = checkCombinator2(i)) tokens[i].combinatorType = 2;
  else if (l = checkCombinator3(i)) tokens[i].combinatorType = 3;

  return l;
}

/**
 * @return {!Node}
 */
function getCombinator() {
  let type = tokens[pos].combinatorType;
  if (type === 1) return getCombinator1();
  if (type === 2) return getCombinator2();
  if (type === 3) return getCombinator3();
}

/**
 * (1) `||`
 *
 * @param {number} i
 * @return {number}
 */
function checkCombinator1(i) {
  if (tokens[i].type === TokenType.VerticalLine &&
      tokens[i + 1].type === TokenType.VerticalLine) return 2;
  else return 0;
}

/**
 * @return {!Node}
 */
function getCombinator1() {
  let type = NodeType.CombinatorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = '||';

  pos += 2;
  return newNode(type, content, line, column);
}

/**
 * (1) `>`
 * (2) `+`
 * (3) `~`
 *
 * @param {number} i
 * @return {number}
 */
function checkCombinator2(i) {
  let type = tokens[i].type;
  if (type === TokenType.PlusSign ||
      type === TokenType.GreaterThanSign ||
      type === TokenType.Tilde) return 1;
  else return 0;
}

function getCombinator2() {
  let type = NodeType.CombinatorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = tokens[pos++].value;

  return newNode(type, content, line, column);
}

/**
 * (1) `/panda/`
 */
function checkCombinator3(i) {
  let start = i;

  if (tokens[i].type === TokenType.Solidus) i++;
  else return 0;

  let l;
  if (l = checkIdent(i)) i += l;
  else return 0;

  if (tokens[i].type === TokenType.Solidus) i++;
  else return 0;

  return i - start;
}

function getCombinator3() {
  let type = NodeType.CombinatorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  // Skip `/`.
  pos++;
  let ident = getIdent();

  // Skip `/`.
  pos++;

  let content = '/' + ident.content + '/';

  return newNode(type, content, line, column);
}

/**
 * Check if token is a multiline comment.
 * @param {number} i Token's index number
 * @return {number} `1` if token is a multiline comment, otherwise `0`
 */
function checkCommentML(i) {
  return i < tokensLength && tokens[i].type === TokenType.CommentML ? 1 : 0;
}

/**
 * Get node with a multiline comment
 * @return {Array} `['commentML', x]` where `x`
 *      is the comment's text (without `/*` and `* /`).
 */
function getCommentML() {
  let startPos = pos;
  let x = tokens[pos].value.substring(2);
  let l = x.length;
  let closed = false;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  if (x.charAt(l - 2) === '*' && x.charAt(l - 1) === '/') {
    x = x.substring(0, l - 2);
    closed = true;
  }

  var end = getLastPosition(x, line, column + 2);
  if (closed) end[1] += 2;
  pos++;

  return newNode(NodeType.CommentMLType, x, token.ln, token.col, end);
}

/**
 * Check if token is part of a single-line comment.
 * @param {number} i Token's index number
 * @return {number} `1` if token is a single-line comment, otherwise `0`
 */
function checkCommentSL(i) {
  return i < tokensLength && tokens[i].type === TokenType.CommentSL ? 1 : 0;
}

/**
 * Get node with a single-line comment.
 * @return {Array} `['commentSL', x]` where `x` is comment's message
 *      (without `//`)
 */
function getCommentSL() {
  var startPos = pos;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;
  var x = tokens[pos++].value.substring(2);
  var end = !x ? [line, column + 1] : getLastPosition(x, line, column + 2);

  return newNode(NodeType.CommentSLType, x, token.ln, token.col, end);
}

/**
 * Check if token is part of a condition
 * (e.g. `@if ...`, `@else if ...` or `@else ...`).
 * @param {number} i Token's index number
 * @return {number} Length of the condition
 */
function checkCondition(i) {
  let start = i;
  let l;
  let _i;
  let s;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (['if', 'else'].indexOf(tokens[start + 1].value) < 0) return 0;

  while (i < tokensLength) {
    if (l = checkBlock(i)) break;

    s = checkSC(i);
    _i = i + s;

    if (l = _checkCondition(_i)) i += l + s;
    else break;
  }

  return i - start;
}

function _checkCondition(i) {
  return checkVariable(i) ||
       checkNumber(i) ||
       checkInterpolation(i) ||
       checkIdent(i) ||
       checkOperator(i) ||
       checkCombinator(i) ||
       checkString(i);
}

/**
 * Get node with a condition.
 * @return {Array} `['condition', x]`
 */
function getCondition() {
  let startPos = pos;
  let x = [getAtkeyword()];

  while (pos < tokensLength) {
    if (checkBlock(pos)) break;

    var s = checkSC(pos);
    var _pos = pos + s;

    if (!_checkCondition(_pos)) break;

    if (s) x = x.concat(getSC());
    x.push(_getCondition());
  }

  var token = tokens[startPos];
  return newNode(NodeType.ConditionType, x, token.ln, token.col);
}

function _getCondition() {
  if (checkVariable(pos)) return getVariable();
  if (checkNumber(pos)) return getNumber();
  if (checkInterpolation(pos)) return getInterpolation();
  if (checkIdent(pos)) return getIdent();
  if (checkOperator(pos)) return getOperator();
  if (checkCombinator(pos)) return getCombinator();
  if (checkString(pos)) return getString();
}

/**
 * Check if token is part of a conditional statement
 * (e.g. `@if ... {} @else if ... {} @else ... {}`).
 * @param {number} i Token's index number
 * @return {number} Length of the condition
 */
function checkConditionalStatement(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkCondition(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a condition.
 * @return {Array} `['condition', x]`
 */
function getConditionalStatement() {
  let startPos = pos;
  let x = [];

  x.push(getCondition());
  x = x.concat(getSC());
  x.push(getBlock());

  var token = tokens[startPos];
  return newNode(NodeType.ConditionalStatementType, x, token.ln, token.col);
}

/**
 * Check if token is part of a declaration (property-value pair)
 * @param {number} i Token's index number
 * @return {number} Length of the declaration
 */
function checkDeclaration(i) {
  return checkDeclaration1(i) || checkDeclaration2(i);
}

/**
 * Get node with a declaration
 * @return {Array} `['declaration', ['property', x], ['propertyDelim'],
 *       ['value', y]]`
 */
function getDeclaration() {
  return checkDeclaration1(pos) ? getDeclaration1() : getDeclaration2();
}

/**
 * Check if token is part of a declaration (property-value pair)
 * @param {number} i Token's index number
 * @return {number} Length of the declaration
 */
function checkDeclaration1(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkProperty(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkPropertyDelim(i)) i++;
  else return 0;

  if (l = checkValue(i)) return i + l - start;

  if (l = checkS(i)) i += l;

  if (l = checkValue(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a declaration
 * @return {Array} `['declaration', ['property', x], ['propertyDelim'],
 *       ['value', y]]`
 */
function getDeclaration1() {
  let startPos = pos;
  let x = [];

  x.push(getProperty());
  if (checkS(pos)) x.push(getS());
  x.push(getPropertyDelim());
  if (checkS(pos)) x.push(getS());
  x.push(getValue());

  var token = tokens[startPos];
  return newNode(NodeType.DeclarationType, x, token.ln, token.col);
}

/**
 * Check if token is part of a declaration (property-value pair)
 * @param {number} i Token's index number
 * @return {number} Length of the declaration
 */
function checkDeclaration2(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkPropertyDelim(i)) i++;
  else return 0;

  if (l = checkProperty(i)) i += l;
  else return 0;

  if (l = checkValue(i)) return i + l - start;

  if (l = checkSC(i)) i += l;

  if (l = checkValue(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a declaration
 * @return {Array} `['declaration', ['propertyDelim'], ['property', x],
 *       ['value', y]]`
 */
function getDeclaration2() {
  let startPos = pos;
  let x = [];

  x.push(getPropertyDelim());
  x.push(getProperty());
  x = x.concat(getSC());
  x.push(getValue());

  var token = tokens[startPos];
  return newNode(NodeType.DeclarationType, x, token.ln, token.col);
}

/**
 * Check if token is a semicolon
 * @param {number} i Token's index number
 * @return {number} `1` if token is a semicolon, otherwise `0`
 */
function checkDeclDelim(i) {
  if (i >= tokensLength) return 0;

  return (tokens[i].type === TokenType.Newline ||
      tokens[i].type === TokenType.Semicolon) ? 1 : 0;
}

/**
 * Get node with a semicolon
 * @return {Array} `['declDelim']`
 */
function getDeclDelim() {
  var startPos = pos++;

  var token = tokens[startPos];
  return newNode(NodeType.DeclDelimType, '\n', token.ln, token.col);
}

/**
 * Check if token if part of `!default` word.
 * @param {number} i Token's index number
 * @return {number} Length of the `!default` word
 */
function checkDefault(i) {
  let start = i;
  let l;

  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.ExclamationMark) return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].value === 'default') {
    tokens[start].defaultEnd = i;
    return i - start + 1;
  } else {
    return 0;
  }
}

/**
 * Get node with a `!default` word
 * @return {Array} `['default', sc]` where `sc` is optional whitespace
 */
function getDefault() {
  var token = tokens[pos];
  var line = token.ln;
  var column = token.col;
  let content = joinValues(pos, token.defaultEnd);

  pos = token.defaultEnd + 1;

  return newNode(NodeType.DefaultType, content, line, column);
}

/**
 * Check if token is a comma
 * @param {number} i Token's index number
 * @return {number} `1` if token is a comma, otherwise `0`
 */
function checkDelim(i) {
  return i < tokensLength && tokens[i].type === TokenType.Comma ? 1 : 0;
}

/**
 * Get node with a comma
 * @return {Array} `['delim']`
 */
function getDelim() {
  var startPos = pos++;

  var token = tokens[startPos];
  return newNode(NodeType.DelimType, ',', token.ln, token.col);
}


/**
 * Check if token is part of a number with dimension unit (e.g. `10px`)
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkDimension(i) {
  let ln = checkNumber(i);
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
  let type = NodeType.DimensionType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [
      getNumber(),
      getUnit()
    ];

  return newNode(type, content, line, column);
}

/**
 * Check if token is unit
 * @param {Number} i Token's index number
 * @return {Number}
 */
function checkUnit(i) {
  let units = [
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
  let type = NodeType.IdentType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = token.value;

  pos++;

  return newNode(type, content, line, column);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkExpression(i) {
  var start = i;

  if (i >= tokensLength || tokens[i++].value !== 'expression' ||
      i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis) {
    return 0;
  }

  return tokens[i].right - start + 1;
}

/**
 * @return {Array}
 */
function getExpression() {
  let startPos = pos;
  let x;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  pos++;

  x = joinValues(pos + 1, tokens[pos].right - 1);
  var end = getLastPosition(x, line, column, 1);
  if (end[0] === line) end[1] += 11;
  pos = tokens[pos].right + 1;

  return newNode(NodeType.ExpressionType, x, token.ln, token.col, end);
}

function checkExtend(i) {
  let l = 0;

  if (l = checkExtend1(i)) tokens[i].extend_child = 1;
  else if (l = checkExtend2(i)) tokens[i].extend_child = 2;

  return l;
}

function getExtend() {
  let type = tokens[pos].extend_child;

  if (type === 1) return getExtend1();
  else if (type === 2) return getExtend2();
}

/**
 * Checks if token is part of an extend with `!optional` flag.
 * @param {number} i
 */
function checkExtend1(i) {
  var start = i;
  var l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'extend') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkOptional(i)) i += l;
  else return 0;

  return i - start;
}

function getExtend1() {
  let startPos = pos;
  let x = [].concat(
      [getAtkeyword()],
      getSC(),
      getSelectorsGroup(),
      getSC(),
      getOptional()
      );

  var token = tokens[startPos];
  return newNode(NodeType.ExtendType, x, token.ln, token.col);
}

/**
 * Checks if token is part of an extend without `!optional` flag.
 * @param {number} i
 */
function checkExtend2(i) {
  var start = i;
  var l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'extend') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  return i - start;
}

function getExtend2() {
  let startPos = pos;
  let x = [].concat(
      [getAtkeyword()],
      getSC(),
      getSelectorsGroup()
      );

  var token = tokens[startPos];
  return newNode(NodeType.ExtendType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkFunction(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i < tokensLength && tokens[i].type === TokenType.LeftParenthesis ?
      tokens[i].right - start + 1 : 0;
}

/**
 * @return {Array}
 */
function getFunction() {
  let startPos = pos;
  let x = getIdentOrInterpolation();
  let body;

  body = getArguments();

  x.push(body);

  var token = tokens[startPos];
  return newNode(NodeType.FunctionType, x, token.ln, token.col);
}

/**
 * @return {Array}
 */
function getArguments() {
  let startPos = pos;
  let x = [];
  let body;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  pos++;

  while (pos < tokensLength &&
      tokens[pos].type !== TokenType.RightParenthesis) {
    if (checkDeclaration(pos)) x.push(getDeclaration());
    else if (checkArgument(pos)) {
      body = getArgument();
      if (typeof body.content === 'string') x.push(body);
      else x = x.concat(body);
    } else if (checkClass(pos)) x.push(getClass());
    else throwError();
  }

  var end = getLastPosition(x, line, column, 1);
  pos++;

  return newNode(NodeType.ArgumentsType, x, token.ln, token.col, end);
}

/**
 * Check if token is part of `!global` word
 * @param {number} i Token's index number
 * @return {number}
 */
function checkGlobal(i) {
  let start = i;
  let l;

  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.ExclamationMark) return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].value === 'global') {
    tokens[start].globalEnd = i;
    return i - start + 1;
  } else {
    return 0;
  }
}

/**
 * Get node with `!global` word
 */
function getGlobal() {
  var token = tokens[pos];
  var line = token.ln;
  var column = token.col;
  let content = joinValues(pos, token.globalEnd);

  pos = token.globalEnd + 1;

  return newNode(NodeType.GlobalType, content, line, column);
}

/**
 * Check if token is part of an identifier
 * @param {number} i Token's index number
 * @return {number} Length of the identifier
 */
function checkIdent(i) {
  let start = i;
  let wasIdent;
  let l;

  if (i >= tokensLength) return 0;

  // Check if token is part of an identifier starting with `_`:
  if (tokens[i].type === TokenType.LowLine) return checkIdentLowLine(i);

  if (tokens[i].type === TokenType.HyphenMinus &&
      tokens[i + 1].type === TokenType.DecimalNumber) return 0;

  // If token is a character, `-`, `$` or `*`, skip it & continue:
  if (l = _checkIdent(i)) i += l;
  else return 0;

  // Remember if previous token's type was identifier:
  wasIdent = tokens[i - 1].type === TokenType.Identifier;

  while (i < tokensLength) {
    l = _checkIdent(i);

    if (!l) break;

    wasIdent = true;
    i += l;
  }

  if (!wasIdent && tokens[start].type !== TokenType.Asterisk) return 0;

  tokens[start].ident_last = i - 1;

  return i - start;
}

/**
 * Check if the token type can be considered an ident
 * @param {number} i Token's index number
 * @returns {number} 1 or 0 based on whether we have a match
 */
function _checkIdent(i) {
  if (tokens[i].type === TokenType.HyphenMinus ||
      tokens[i].type === TokenType.Identifier ||
      tokens[i].type === TokenType.DollarSign ||
      tokens[i].type === TokenType.LowLine ||
      tokens[i].type === TokenType.DecimalNumber ||
      tokens[i].type === TokenType.Asterisk) return 1;
  return 0;
}

/**
 * Check if token is part of an identifier starting with `_`
 * @param {number} i Token's index number
 * @return {number} Length of the identifier
 */
function checkIdentLowLine(i) {
  var start = i;

  if (i++ >= tokensLength) return 0;

  for (; i < tokensLength; i++) {
    if (tokens[i].type !== TokenType.HyphenMinus &&
        tokens[i].type !== TokenType.DecimalNumber &&
        tokens[i].type !== TokenType.LowLine &&
        tokens[i].type !== TokenType.Identifier) break;
  }

  // Save index number of the last token of the identifier:
  tokens[start].ident_last = i - 1;

  return i - start;
}

/**
 * Get node with an identifier
 * @return {Array} `['ident', x]` where `x` is identifier's name
 */
function getIdent() {
  let startPos = pos;
  let x = joinValues(pos, tokens[pos].ident_last);

  pos = tokens[pos].ident_last + 1;

  var token = tokens[startPos];
  return newNode(NodeType.IdentType, x, token.ln, token.col);
}

function checkIdentOrInterpolation(i) {
  let start = i;
  let l;

  while (i < tokensLength) {
    if (l = checkInterpolation(i) || checkIdent(i)) i += l;
    else break;
  }

  return i - start;
}

function getIdentOrInterpolation() {
  let x = [];

  while (pos < tokensLength) {
    if (checkInterpolation(pos)) x.push(getInterpolation());
    else if (checkIdent(pos)) x.push(getIdent());
    else break;
  }

  return x;
}

/**
 * Check if token is part of `!important` word
 * @param {number} i Token's index number
 * @return {number}
 */
function checkImportant(i) {
  let start = i;
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
 * @return {Array} `['important', sc]` where `sc` is optional whitespace
 */
function getImportant() {
  var token = tokens[pos];
  var line = token.ln;
  var column = token.col;
  let content = joinValues(pos, token.importantEnd);

  pos = token.importantEnd + 1;

  return newNode(NodeType.ImportantType, content, line, column);
}

/**
 * Check if token is part of an included mixin (`@include` or `@extend`
 *      directive).
 * @param {number} i Token's index number
 * @return {number} Length of the included mixin
 */
function checkInclude(i) {
  var l;

  if (i >= tokensLength) return 0;

  if (l = checkInclude1(i)) tokens[i].include_type = 1;
  else if (l = checkInclude2(i)) tokens[i].include_type = 2;
  else if (l = checkInclude3(i)) tokens[i].include_type = 3;
  else if (l = checkInclude4(i)) tokens[i].include_type = 4;
  else if (l = checkInclude5(i)) tokens[i].include_type = 5;
  else if (l = checkInclude6(i)) tokens[i].include_type = 6;
  else if (l = checkInclude7(i)) tokens[i].include_type = 7;
  else if (l = checkInclude8(i)) tokens[i].include_type = 8;

  return l;
}

/**
 * Get node with included mixin
 * @return {Array} `['include', x]`
 */
function getInclude() {
  switch (tokens[pos].include_type) {
    case 1: return getInclude1();
    case 2: return getInclude2();
    case 3: return getInclude3();
    case 4: return getInclude4();
    case 5: return getInclude5();
    case 6: return getInclude6();
    case 7: return getInclude7();
    case 8: return getInclude8();
  }
}

/**
 * Check if token is part of an included mixin like `@include nani(foo) {...}`
 * @param {number} i Token's index number
 * @return {number} Length of the include
 */
function checkInclude1(i) {
  let start = i;
  let l;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'include') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkArguments(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with included mixin like `@include nani(foo) {...}`
 * @return {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
 *      ['arguments', z], sc, ['block', q], sc` where `x` is `include` or
 *      `extend`, `y` is mixin's identifier (selector), `z` are arguments
 *      passed to the mixin, `q` is block passed to the mixin and `sc`
 *      are optional whitespaces
 */
function getInclude1() {
  let startPos = pos;
  let x = [].concat(
      getAtkeyword(),
      getSC(),
      getIdentOrInterpolation(),
      getSC(),
      getArguments(),
      getSC(),
      getBlock()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an included mixin like `@include nani(foo)`
 * @param {number} i Token's index number
 * @return {number} Length of the include
 */
function checkInclude2(i) {
  let start = i;
  let l;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'include') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkArguments(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with included mixin like `@include nani(foo)`
 * @return {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
 *      ['arguments', z], sc]` where `x` is `include` or `extend`, `y` is
 *      mixin's identifier (selector), `z` are arguments passed to the
 *      mixin and `sc` are optional whitespaces
 */
function getInclude2() {
  let startPos = pos;
  let x = [].concat(
      getAtkeyword(),
      getSC(),
      getIdentOrInterpolation(),
      getSC(),
      getArguments()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an included mixin with a content block passed
 *      as an argument (e.g. `@include nani {...}`)
 * @param {number} i Token's index number
 * @return {number} Length of the mixin
 */
function checkInclude3(i) {
  let start = i;
  let l;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'include') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with an included mixin with a content block passed
 *      as an argument (e.g. `@include nani {...}`)
 * @return {Array} `['include', x]`
 */
function getInclude3() {
  let startPos = pos;
  let x = [].concat(
      getAtkeyword(),
      getSC(),
      getIdentOrInterpolation(),
      getSC(),
      getBlock()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkInclude4(i) {
  let start = i;
  let l;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (tokens[start + 1].value !== 'include') return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Array} `['include', x]`
 */
function getInclude4() {
  let startPos = pos;
  let x = [].concat(
      getAtkeyword(),
      getSC(),
      getIdentOrInterpolation()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an included mixin like `+nani(foo) {...}`
 * @param {number} i Token's index number
 * @return {number} Length of the include
 */
function checkInclude5(i) {
  let start = i;
  let l;

  if (tokens[i].type === TokenType.PlusSign) i++;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkArguments(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with included mixin like `+nani(foo) {...}`
 * @return {Array} `['include', ['operator', '+'], ['selector', x], sc,
 *      ['arguments', y], sc, ['block', z], sc` where `x` is
 *      mixin's identifier (selector), `y` are arguments passed to the
 *      mixin, `z` is block passed to mixin and `sc` are optional whitespaces
 */
function getInclude5() {
  let startPos = pos;
  let x = [].concat(
      getOperator(),
      getIdentOrInterpolation(),
      getSC(),
      getArguments(),
      getSC(),
      getBlock()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an included mixin like `+nani(foo)`
 * @param {number} i Token's index number
 * @return {number} Length of the include
 */
function checkInclude6(i) {
  let start = i;
  let l;

  if (tokens[i].type === TokenType.PlusSign) i++;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkArguments(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with included mixin like `+nani(foo)`
 * @return {Array} `['include', ['operator', '+'], ['selector', y], sc,
 *      ['arguments', z], sc]` where `y` is
 *      mixin's identifier (selector), `z` are arguments passed to the
 *      mixin and `sc` are optional whitespaces
 */
function getInclude6() {
  let startPos = pos;
  let x = [].concat(
      getOperator(),
      getIdentOrInterpolation(),
      getSC(),
      getArguments()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an included mixin with a content block passed
 *      as an argument (e.g. `+nani {...}`)
 * @param {number} i Token's index number
 * @return {number} Length of the mixin
 */
function checkInclude7(i) {
  let start = i;
  let l;

  if (tokens[i].type === TokenType.PlusSign) i++;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with an included mixin with a content block passed
 *      as an argument (e.g. `+nani {...}`)
 * @return {Array} `['include', x]`
 */
function getInclude7() {
  let startPos = pos;
  let x = [].concat(
      getOperator(),
      getIdentOrInterpolation(),
      getSC(),
      getBlock()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkInclude8(i) {
  let start = i;
  let l;

  if (tokens[i].type === TokenType.PlusSign) i++;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * @return {Array} `['include', x]`
 */
function getInclude8() {
  let startPos = pos;
  let x = [].concat(
      getOperator(),
      getIdentOrInterpolation()
  );

  var token = tokens[startPos];
  return newNode(NodeType.IncludeType, x, token.ln, token.col);
}

/**
 * Check if token is part of an interpolated variable (e.g. `#{$nani}`).
 * @param {number} i Token's index number
 * @return {number}
 */
function checkInterpolation(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type !== TokenType.NumberSign ||
      !tokens[i + 1] ||
      tokens[i + 1].type !== TokenType.LeftCurlyBracket) return 0;

  i += 2;


  while (tokens[i].type !== TokenType.RightCurlyBracket) {
    if (l = checkArgument(i)) i += l;
    else return 0;
  }

  return tokens[i].type === TokenType.RightCurlyBracket ? i - start + 1 : 0;
}

/**
 * Get node with an interpolated variable
 * @return {Array} `['interpolation', x]`
 */
function getInterpolation() {
  let startPos = pos;
  let x = [];
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  // Skip `#{`:
  pos += 2;


  while (pos < tokensLength &&
      tokens[pos].type !== TokenType.RightCurlyBracket) {
    let body = getArgument();
    if (typeof body.content === 'string') x.push(body);
    else x = x.concat(body);
  }

  var end = getLastPosition(x, line, column, 1);
  // Skip `}`:
  pos++;

  return newNode(NodeType.InterpolationType, x, token.ln, token.col, end);
}

/**
 * Check a single keyframe block - `5% {}`
 * @param {number} i
 * @return {number}
 */
function checkKeyframesBlock(i) {
  let start = i;
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
 * @return {Node}
 */
function getKeyframesBlock() {
  let type = NodeType.RulesetType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [].concat(
      getKeyframesSelectorsGroup(),
      getSC(),
      [getBlock()]
      );

  return newNode(type, content, line, column);
}

/**
 * Check all keyframe blocks - `5% {} 100% {}`
 * @param {number} i
 * @return {number}
 */
function checkKeyframesBlocks(i) {
  return i < tokensLength && tokens[i].block_end ?
      tokens[i].block_end - i + 1 : 0;
}

/**
 * Get all keyframe blocks - `5% {} 100% {}`
 * @return {Node}
 */
function getKeyframesBlocks() {
  let type = NodeType.BlockType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];
  let keyframesBlocksEnd = token.block_end;

  while (pos < keyframesBlocksEnd) {
    if (checkSC(pos)) content = content.concat(getSC());
    else if (checkKeyframesBlock(pos)) content.push(getKeyframesBlock());
    else if (checkAtrule(pos)) content.push(getAtrule()); // @content
    else break;
  }

  return newNode(type, content, line, column);
}

/**
 * Check if token is part of a @keyframes rule.
 * @param {number} i Token's index number
 * @return {number} Length of the @keyframes rule
 */
function checkKeyframesRule(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  var atruleName = joinValues2(i - l, l);
  if (atruleName.indexOf('keyframes') === -1) return 0;

  if (l = checkSC(i)) i += l;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
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
  let type = NodeType.AtruleType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [].concat(
      [getAtkeyword()],
      getSC(),
      getIdentOrInterpolation(),
      getSC(),
      [getKeyframesBlocks()]
      );

  return newNode(type, content, line, column);
}

/**
 * Check a single keyframe selector - `5%`, `from` etc
 * @param {number} i
 * @return {number}
 */
function checkKeyframesSelector(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkIdent(i)) {
    // Valid selectors are only `from` and `to`.
    let selector = joinValues2(i, l);
    if (selector !== 'from' && selector !== 'to') return 0;

    i += l;
    tokens[start].keyframesSelectorType = 1;
  } else if (l = checkPercentage(i)) {
    i += l;
    tokens[start].keyframesSelectorType = 2;
  } else if (l = checkInterpolation(i)) {
    i += l;
    tokens[start].keyframesSelectorType = 3;
  } else {
    return 0;
  }

  return i - start;
}

/**
 * Get a single keyframe selector
 * @return {Node}
 */
function getKeyframesSelector() {
  let keyframesSelectorType = NodeType.KeyframesSelectorType;
  let selectorType = NodeType.SelectorType;

  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  if (token.keyframesSelectorType === 1) {
    content.push(getIdent());
  } else if (token.keyframesSelectorType === 2) {
    content.push(getPercentage());
  } else if (token.keyframesSelectorType === 3) {
    content.push(getInterpolation());
  }

  let keyframesSelector = newNode(keyframesSelectorType, content, line, column);
  return newNode(selectorType, [keyframesSelector], line, column);
}

/**
 * Check the keyframe's selector groups
 * @param {number} i
 * @return {number}
 */
function checkKeyframesSelectorsGroup(i) {
  let start = i;
  let l;

  if (l = checkKeyframesSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    let sb = checkSC(i);
    let c = checkDelim(i + sb);
    if (!c) break;
    let sa = checkSC(i + sb + c);
    if (l = checkKeyframesSelector(i + sb + c + sa)) i += sb + c + sa + l;
    else break;
  }

  tokens[start].selectorsGroupEnd = i;

  return i - start;
}

/**
 * Get the keyframe's selector groups
 * @return {Array} An array of keyframe selectors
 */
function getKeyframesSelectorsGroup() {
  let selectorsGroup = [];
  let selectorsGroupEnd = tokens[pos].selectorsGroupEnd;

  selectorsGroup.push(getKeyframesSelector());

  while (pos < selectorsGroupEnd) {
    selectorsGroup = selectorsGroup.concat(getSC());
    selectorsGroup.push(getDelim());
    selectorsGroup = selectorsGroup.concat(getSC());
    selectorsGroup.push(getKeyframesSelector());
  }

  return selectorsGroup;
}

/**
 * Check if token is part of a loop.
 * @param {number} i Token's index number
 * @return {number} Length of the loop
 */
function checkLoop(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkAtkeyword(i)) i += l;
  else return 0;

  if (['for', 'each', 'while'].indexOf(tokens[start + 1].value) < 0) return 0;

  while (i < tokensLength) {
    if (l = checkBlock(i)) {
      i += l;
      break;
    } else if (l = checkVariable(i) ||
               checkNumber(i) ||
               checkInterpolation(i) ||
               checkIdent(i) ||
               checkSC(i) ||
               checkOperator(i) ||
               checkCombinator(i) ||
               checkString(i)) i += l;
    else return 0;
  }

  return i - start;
}

/**
 * Get node with a loop.
 * @return {Array} `['loop', x]`
 */
function getLoop() {
  let startPos = pos;
  let x = [];

  x.push(getAtkeyword());

  while (pos < tokensLength) {
    if (checkBlock(pos)) {
      x.push(getBlock());
      break;
    }
    else if (checkVariable(pos)) x.push(getVariable());
    else if (checkNumber(pos)) x.push(getNumber());
    else if (checkInterpolation(pos)) x.push(getInterpolation());
    else if (checkIdent(pos)) x.push(getIdent());
    else if (checkOperator(pos)) x.push(getOperator());
    else if (checkCombinator(pos)) x.push(getCombinator());
    else if (checkSC(pos)) x = x.concat(getSC());
    else if (checkString(pos)) x.push(getString());
  }

  var token = tokens[startPos];
  return newNode(NodeType.LoopType, x, token.ln, token.col);
}

/**
 * Check if token is part of a mixin
 * @param {number} i Token's index number
 * @return {number} Length of the mixin
 */
function checkMixin(i) {
  return checkMixin1(i) || checkMixin2(i);
}

/**
 * Get node with a mixin
 * @return {Array} `['mixin', x]`
 */
function getMixin() {
  return checkMixin1(pos) ? getMixin1() : getMixin2();
}

/**
 * Check if token is part of a mixin
 * @param {number} i Token's index number
 * @return {number} Length of the mixin
 */
function checkMixin1(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if ((l = checkAtkeyword(i)) && tokens[i + 1].value === 'mixin') i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else {
    if (l = checkArguments(i)) i += l;

    if (l = checkSC(i)) i += l;

    if (l = checkBlock(i)) i += l;
    else return 0;
  }

  return i - start;
}

/**
 * Get node with a mixin
 * @return {Array} `['mixin', x]`
 */
function getMixin1() {
  let startPos = pos;
  let x = [getAtkeyword()];

  x = x.concat(getSC());

  if (checkIdentOrInterpolation(pos)) x = x.concat(getIdentOrInterpolation());

  x = x.concat(getSC());

  if (checkBlock(pos)) x.push(getBlock());
  else {
    if (checkArguments(pos)) x.push(getArguments());

    x = x.concat(getSC());

    x.push(getBlock());
  }

  var token = tokens[startPos];
  return newNode(NodeType.MixinType, x, token.ln, token.col);
}

/**
 * Check if token is part of a mixin
 * @param {number} i Token's index number
 * @return {number} Length of the mixin
 */
function checkMixin2(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.EqualsSign) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) i += l;
  else {
    if (l = checkArguments(i)) i += l;

    if (l = checkSC(i)) i += l;

    if (l = checkBlock(i)) i += l;
    else return 0;
  }

  return i - start;
}

/**
* Get node with a mixin
* @return {Array} `['mixin', x]`
*/
function getMixin2() {
  let startPos = pos;
  let x = [getOperator()];

  x = x.concat(getSC());

  if (checkIdentOrInterpolation(pos)) x = x.concat(getIdentOrInterpolation());

  x = x.concat(getSC());

  if (checkBlock(pos)) x.push(getBlock());
  else {
    if (checkArguments(pos)) x.push(getArguments());

    x = x.concat(getSC());

    x.push(getBlock());
  }

  var token = tokens[startPos];
  return newNode(NodeType.MixinType, x, token.ln, token.col);
}

/**
 * Check if token is a namespace sign (`|`)
 * @param {number} i Token's index number
 * @return {number} `1` if token is `|`, `0` if not
 */
function checkNamespace(i) {
  return i < tokensLength && tokens[i].type === TokenType.VerticalLine ? 1 : 0;
}

/**
 * Get node with a namespace sign
 * @return {Array} `['namespace']`
 */
function getNamespace() {
  var startPos = pos++;

  var token = tokens[startPos];
  return newNode(NodeType.NamespaceType, '|', token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkNmName2(i) {
  if (tokens[i].type === TokenType.Identifier) return 1;
  else if (tokens[i].type !== TokenType.DecimalNumber) return 0;

  i++;

  return i < tokensLength && tokens[i].type === TokenType.Identifier ? 2 : 1;
}

/**
 * @return {string}
 */
function getNmName2() {
  var s = tokens[pos].value;

  if (tokens[pos++].type === TokenType.DecimalNumber &&
      pos < tokensLength &&
      tokens[pos].type === TokenType.Identifier) s += tokens[pos++].value;

  return s;
}

/**
 * Check if token is part of a number
 * @param {number} i Token's index number
 * @return {number} Length of number
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
 * @return {Array} `['number', x]` where `x` is a number converted
 *      to string.
 */
function getNumber() {
  let s = '';
  let startPos = pos;
  let l = tokens[pos].number_l;

  for (var j = 0; j < l; j++) {
    s += tokens[pos + j].value;
  }

  pos += l;

  var token = tokens[startPos];
  return newNode(NodeType.NumberType, s, token.ln, token.col);
}

/**
 * Check if token is an operator (`/`, `%`, `,`, `:` or `=`).
 * @param {number} i Token's index number
 * @return {number} `1` if token is an operator, otherwise `0`
 */
function checkOperator(i) {
  if (i >= tokensLength) return 0;

  switch (tokens[i].type) {
    case TokenType.Solidus:
    case TokenType.PercentSign:
    case TokenType.Comma:
    case TokenType.Colon:
    case TokenType.EqualsSign:
    case TokenType.EqualitySign:
    case TokenType.InequalitySign:
    case TokenType.LessThanSign:
    case TokenType.GreaterThanSign:
    case TokenType.Asterisk:
      return 1;
  }

  return 0;
}

/**
 * Get node with an operator
 * @return {Array} `['operator', x]` where `x` is an operator converted
 *      to string.
 */
function getOperator() {
  let startPos = pos;
  let x = tokens[pos++].value;

  var token = tokens[startPos];
  return newNode(NodeType.OperatorType, x, token.ln, token.col);
}

/**
 * Check if token is part of `!optional` word
 * @param {number} i Token's index number
 * @return {number}
 */
function checkOptional(i) {
  let start = i;
  let l;

  if (i >= tokensLength ||
      tokens[i++].type !== TokenType.ExclamationMark) return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].value === 'optional') {
    tokens[start].optionalEnd = i;
    return i - start + 1;
  } else {
    return 0;
  }
}

/**
 * Get node with `!optional` word
 */
function getOptional() {
  var token = tokens[pos];
  var line = token.ln;
  var column = token.col;
  let content = joinValues(pos, token.optionalEnd);

  pos = token.optionalEnd + 1;

  return newNode(NodeType.OptionalType, content, line, column);
}

/**
 * Check if token is part of text inside parentheses, e.g. `(1)`
 * @param {number} i Token's index number
 * @return {number}
 */
function checkParentheses(i) {
  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  return tokens[i].right - i + 1;
}

/**
 * Get node with text inside parentheses, e.g. `(1)`
 * @return {Node}
 */
function getParentheses() {
  let type = NodeType.ParenthesesType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  pos++;

  var tsets = getTsets();
  var end = getLastPosition(tsets, line, column, 1);
  pos++;

  return newNode(type, tsets, line, column, end);
}

/**
 * Check if token is a parent selector, e.g. `&`
 * @param {number} i Token's index number
 * @return {number}
 */
function checkParentSelector(i) {
  return i < tokensLength && tokens[i].type === TokenType.Ampersand ? 1 : 0;
}

/**
 * Get node with a parent selector
 * @return {Node}
 */
function getParentSelector() {
  const startPos = pos;
  const token = tokens[startPos];

  pos++;

  return newNode(NodeType.ParentSelectorType, '&', token.ln, token.col);
}

/**
 * Check if token is a parent selector extension, e.g. `&--foo-bar`
 * @param {number} i Token's index number
 * @returns {number} Length of the parent selector extension
 */
function checkParentSelectorExtension(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  while (i < tokensLength) {
    if (l = checkNumber(i) || checkIdentOrInterpolation(i)) i += l;
    else if (tokens[i].type === TokenType.HyphenMinus) i += 1;
    else break;
  }

  return i - start;
}

/**
 * Get parent selector extension node
 * @return {Node}
 */
function getParentSelectorExtension() {
  const type = NodeType.ParentSelectorExtensionType;
  const token = tokens[pos];
  const line = token.ln;
  const column = token.col;
  let content = [];

  while (pos < tokensLength) {
    if (checkNumber(pos)) {
      content.push(getNumber());
    } else if (checkIdentOrInterpolation(pos)) {
      content = content.concat(getIdentOrInterpolation());
    } else if (tokens[pos].type === TokenType.HyphenMinus) {
      content.push(
        newNode(
          NodeType.IdentType,
          tokens[pos].value,
          tokens[pos].ln,
          tokens[pos].col
        )
      );
      pos++;
    } else break;
  }

  return newNode(type, content, line, column);
}

/**
 * Check if token is a parent selector with an extension or not
 * @param {number} i Token's index number
 * @return {number} Length of the parent selector and extension if applicable
 */
function checkParentSelectorWithExtension(i) {
  const start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkParentSelector(i)) i += l;
  else return 0;

  if (l = checkParentSelectorExtension(i)) i += l;

  return i - start;
}

/**
 * Get parent selector node and extension node if applicable
 * @return {Array}
 */
function getParentSelectorWithExtension() {
  let content = [getParentSelector()];

  if (checkParentSelectorExtension(pos))
    content.push(getParentSelectorExtension());

  return content;
}

/**
 * Check if token is part of a number or an interpolation with a percent sign
 * (e.g. `10%`).
 * @param {number} i Token's index number
 * @return {number}
 */
function checkPercentage(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkNumberOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;

  if (tokens[i].type !== TokenType.PercentSign) return 0;

  return i - start + 1;
}

/**
 * Get a percentage node that contains either a number or an interpolation
 * @return {Object} The percentage node
 */
function getPercentage() {
  let startPos = pos;
  let token = tokens[startPos];
  let line = token.ln;
  let column = token.col;
  let content = getNumberOrInterpolation();
  let end = getLastPosition(content, line, column, 1);

  // Skip %
  pos++;

  return newNode(NodeType.PercentageType, content, token.ln, token.col, end);
}

/**
 * Check if token is a number or an interpolation
 * @param {number} i Token's index number
 * @return {number}
 */
function checkNumberOrInterpolation(i) {
  let start = i;
  let l;

  while (i < tokensLength) {
    if (l = checkInterpolation(i) || checkNumber(i)) i += l;
    else break;
  }

  return i - start;
}

/**
 * Get a number and/or interpolation node
 * @return {Array} An array containing a single or multiple nodes
 */
function getNumberOrInterpolation() {
  let content = [];

  while (pos < tokensLength) {
    if (checkInterpolation(pos)) content.push(getInterpolation());
    else if (checkNumber(pos)) content.push(getNumber());
    else break;
  }

  return content;
}

/**
 * Check if token is part of a placeholder selector (e.g. `%abc`).
 * @param {number} i Token's index number
 * @return {number} Length of the selector
 */
function checkPlaceholder(i) {
  var l;

  if (i >= tokensLength) return 0;

  if (tokens[i].placeholder_l) return tokens[i].placeholder_l;

  if (tokens[i].type !== TokenType.PercentSign) {
    return 0;
  }

  if (l = checkIdentOrInterpolation(i + 1)) {
    tokens[i].placeholder_l = l + 1;
    return l + 1;
  }

  return 0;
}

/**
 * Get node with a placeholder selector
 * @return {Array} `['placeholder', ['ident', x]]` where x is a placeholder's
 *      identifier (without `%`, e.g. `abc`).
 */
function getPlaceholder() {
  let startPos = pos;

  pos++;

  let x = getIdentOrInterpolation();

  var token = tokens[startPos];
  return newNode(NodeType.PlaceholderType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkProgid(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (joinValues2(i, 6) === 'progid:DXImageTransform.Microsoft.') i += 6;
  else return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (tokens[i].type === TokenType.LeftParenthesis) {
    tokens[start].progid_end = tokens[i].right;
    i = tokens[i].right + 1;
  } else return 0;

  return i - start;
}

/**
 * @return {Array}
 */
function getProgid() {
  let startPos = pos;
  let progid_end = tokens[pos].progid_end;
  let x = joinValues(pos, progid_end);

  pos = progid_end + 1;

  var token = tokens[startPos];
  return newNode(NodeType.ProgidType, x, token.ln, token.col);
}

/**
 * Check if token is part of a property
 * @param {number} i Token's index number
 * @return {number} Length of the property
 */
function checkProperty(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkVariable(i) || checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

/**
 * Get node with a property
 * @return {Array} `['property', x]`
 */
function getProperty() {
  let startPos = pos;
  let x = [];

  if (checkVariable(pos)) {
    x.push(getVariable());
  } else {
    x = x.concat(getIdentOrInterpolation());
  }

  var token = tokens[startPos];
  return newNode(NodeType.PropertyType, x, token.ln, token.col);
}

/**
 * Check if token is a colon
 * @param {number} i Token's index number
 * @return {number} `1` if token is a colon, otherwise `0`
 */
function checkPropertyDelim(i) {
  return i < tokensLength && tokens[i].type === TokenType.Colon ? 1 : 0;
}

/**
 * Get node with a colon
 * @return {Array} `['propertyDelim']`
 */
function getPropertyDelim() {
  var startPos = pos++;

  var token = tokens[startPos];
  return newNode(NodeType.PropertyDelimType, ':', token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkPseudo(i) {
  return checkPseudoe(i) ||
      checkPseudoc(i);
}

/**
 * @return {Array}
 */
function getPseudo() {
  if (checkPseudoe(pos)) return getPseudoe();
  if (checkPseudoc(pos)) return getPseudoc();
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkPseudoe(i) {
  var l;

  if (i >= tokensLength || tokens[i++].type !== TokenType.Colon ||
      i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

  return (l = checkIdentOrInterpolation(i)) ? l + 2 : 0;
}

/**
 * @return {Array}
 */
function getPseudoe() {
  let startPos = pos;

  pos += 2;

  let x = getIdentOrInterpolation();

  var token = tokens[startPos];
  return newNode(NodeType.PseudoeType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkPseudoc(i) {
  var l;

  if (i >= tokensLength || tokens[i].type !== TokenType.Colon) return 0;

  if (l = checkPseudoClass3(i)) tokens[i].pseudoClassType = 3;
  else if (l = checkPseudoClass4(i)) tokens[i].pseudoClassType = 4;
  else if (l = checkPseudoClass5(i)) tokens[i].pseudoClassType = 5;
  else if (l = checkPseudoClass1(i)) tokens[i].pseudoClassType = 1;
  else if (l = checkPseudoClass2(i)) tokens[i].pseudoClassType = 2;
  else if (l = checkPseudoClass6(i)) tokens[i].pseudoClassType = 6;
  else return 0;

  return l;
}

/**
 * @return {Array}
 */
function getPseudoc() {
  var childType = tokens[pos].pseudoClassType;
  if (childType === 1) return getPseudoClass1();
  if (childType === 2) return getPseudoClass2();
  if (childType === 3) return getPseudoClass3();
  if (childType === 4) return getPseudoClass4();
  if (childType === 5) return getPseudoClass5();
  if (childType === 6) return getPseudoClass6();
}

/**
 * (-) `:not(panda)`
 */
function checkPseudoClass1(i) {
  let start = i;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  let l;
  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  let right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (i !== right) return 0;

  return right - start + 1;
}

/**
 * (-) `:not(panda)`
 */
function getPseudoClass1() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  // Skip `:`.
  pos++;

  content = content.concat(getIdentOrInterpolation());

  {
    let type = NodeType.ArgumentsType;
    let token = tokens[pos];
    let line = token.ln;
    let column = token.col;

    // Skip `(`.
    pos++;

    let selectors = getSelectorsGroup();
    let end = getLastPosition(selectors, line, column, 1);
    let args = newNode(type, selectors, line, column, end);
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
  let start = i;
  let l = 0;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  let right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  return i - start + 1;
}

function getPseudoClass2() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  // Skip `:`.
  pos++;

  content = content.concat(getIdentOrInterpolation());

  let l = tokens[pos].ln;
  let c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  value = value.concat(getSC())
      .concat(getIdentOrInterpolation())
      .concat(getSC());

  let end = getLastPosition(value, l, c, 1);
  let args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(-3n + 2)`
 */
function checkPseudoClass3(i) {
  let start = i;
  let l = 0;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength ||
      tokens[i].type !== TokenType.LeftParenthesis) return 0;

  let right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;

  if (l = checkNumberOrInterpolation(i)) i += l;

  if (i >= tokensLength) return 0;
  if (tokens[i].value === 'n') i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i >= tokensLength) return 0;

  if (tokens[i].type === TokenType.PlusSign ||
      tokens[i].type === TokenType.HyphenMinus) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkNumberOrInterpolation(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  return i - start + 1;
}

function getPseudoClass3() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  // Skip `:`.
  pos++;

  let content = getIdentOrInterpolation();

  let l = tokens[pos].ln;
  let c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  if (checkUnary(pos)) value.push(getUnary());
  if (checkNumberOrInterpolation(pos))
    value = value.concat(getNumberOrInterpolation());

  {
    let l = tokens[pos].ln;
    let c = tokens[pos].col;
    let content = tokens[pos].value;
    let ident = newNode(NodeType.IdentType, content, l, c);
    value.push(ident);
    pos++;
  }

  value = value.concat(getSC());
  if (checkUnary(pos)) value.push(getUnary());
  value = value.concat(getSC());
  if (checkNumberOrInterpolation(pos))
    value = value.concat(getNumberOrInterpolation());
  value = value.concat(getSC());

  let end = getLastPosition(value, l, c, 1);
  let args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(-3n)`
 */
function checkPseudoClass4(i) {
  let start = i;
  let l = 0;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;
  if (tokens[i].type !== TokenType.LeftParenthesis) return 0;

  let right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;

  if (l = checkInterpolation(i)) i += l;

  if (tokens[i].type === TokenType.DecimalNumber) i++;

  if (tokens[i].value === 'n') i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  return i - start + 1;
}

function getPseudoClass4() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  // Skip `:`.
  pos++;

  let content = getIdentOrInterpolation();

  let l = tokens[pos].ln;
  let c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  if (checkUnary(pos)) value.push(getUnary());
  if (checkInterpolation(pos)) value.push(getInterpolation());
  if (checkNumber(pos)) value.push(getNumber());
  if (checkIdent(pos)) value.push(getIdent());
  value = value.concat(getSC());

  let end = getLastPosition(value, l, c, 1);
  let args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:nth-child(+8)`
 */
function checkPseudoClass5(i) {
  let start = i;
  let l = 0;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  if (i >= tokensLength) return 0;
  if (tokens[i].type !== TokenType.LeftParenthesis) return 0;

  let right = tokens[i].right;

  // Skip `(`.
  i++;

  if (l = checkSC(i)) i += l;

  if (l = checkUnary(i)) i += l;
  if (tokens[i].type === TokenType.DecimalNumber) i++;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (i !== right) return 0;

  return i - start + 1;
}

function getPseudoClass5() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  // Skip `:`.
  pos++;

  let content = getIdentOrInterpolation();

  let l = tokens[pos].ln;
  let c = tokens[pos].col;
  let value = [];

  // Skip `(`.
  pos++;

  if (checkUnary(pos)) value.push(getUnary());
  if (checkNumber(pos)) value.push(getNumber());
  value = value.concat(getSC());

  let end = getLastPosition(value, l, c, 1);
  let args = newNode(NodeType.ArgumentsType, value, l, c, end);
  content.push(args);

  // Skip `)`.
  pos++;

  return newNode(type, content, line, column);
}

/**
 * (-) `:checked`
 */
function checkPseudoClass6(i) {
  let start = i;
  let l = 0;

  // Skip `:`.
  i++;

  if (i >= tokensLength) return 0;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

function getPseudoClass6() {
  let type = NodeType.PseudocType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;

  // Skip `:`.
  pos++;

  let content = getIdentOrInterpolation();

  return newNode(type, content, line, column);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkRuleset(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkSelectorsGroup(i)) i += l;
  else return 0;

  if (l = checkSC(i)) i += l;

  if (l = checkBlock(i)) {
    i += l;
  } else if (l = checkSC(i)) {
    i += l;
    if (l = checkBlock(i)) i += l;
    else return 0;
  }
  else return 0;

  return i - start;
}

function getRuleset() {
  let type = NodeType.RulesetType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  content = content.concat(getSelectorsGroup());
  content = content.concat(getSC());
  if (checkBlock(pos)) {
    content.push(getBlock());
  } else {
    content = content.concat(getSC(), getBlock());
  }

  return newNode(type, content, line, column);
}

/**
 * Check if token is marked as a space (if it's a space or a tab
 *      or a line break).
 * @param {number} i
 * @return {number} Number of spaces in a row starting with the given token.
 */
function checkS(i) {
  return i < tokensLength && tokens[i].ws ? tokens[i].ws_last - i + 1 : 0;
}

/**
 * Get node with spaces
 * @return {Array} `['s', x]` where `x` is a string containing spaces
 */
function getS() {
  let startPos = pos;
  let x = joinValues(pos, tokens[pos].ws_last);

  pos = tokens[pos].ws_last + 1;

  var token = tokens[startPos];
  return newNode(NodeType.SType, x, token.ln, token.col);
}

/**
 * Check if token is a space, newline, or a comment.
 * @param {number} i Token's index number
 * @return {number} Number of similar (space, newline, or comment) tokens
 *      in a row starting with the given token.
 */
function checkSLC(i) {
  if (!tokens[i]) return 0;

  let l;
  let lsc = 0;

  while (i < tokensLength) {
    if (!(l = checkS(i)) &&
      !(l = checkCommentML(i)) &&
      !(l = checkCommentSL(i))) break;

    i += l;
    lsc += l;
  }

  return lsc || 0;
}

/**
 * Check if token is a space or a comment.
 * @param {number} i Token's index number
 * @return {number} Number of similar (space or comment) tokens
 *      in a row starting with the given token.
 */
function checkSC(i) {
  if (!tokens[i]) return 0;

  let l;
  let lsc = 0;
  let ln = tokens[i].ln;

  while (i < tokensLength) {
    if (tokens[i].ln !== ln) break;

    if (!(l = checkS(i)) &&
        !(l = checkCommentML(i)) &&
        !(l = checkCommentSL(i))) break;

    i += l;
    lsc += l;

    if (tokens[i] && tokens[i].type === TokenType.Newline) break;
  }

  return lsc || 0;
}

/**
 * Get node with spaces newlines and comments
 * @return {Array} Array containing nodes with spaces (if there are any)
 *      and nodes with comments (if there are any):
 *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
 *      and `y` is a comment's text (without `/*` and `* /`).
 */
function getSLC() {
  let sc = [];

  if (pos >= tokensLength) return sc;

  while (pos < tokensLength) {
    if (checkS(pos)) sc.push(getS());
    else if (checkCommentML(pos)) sc.push(getCommentML());
    else if (checkCommentSL(pos)) sc.push(getCommentSL());
    else break;
  }

  return sc;
}

/**
 * Get node with spaces and comments
 * @return {Array} Array containing nodes with spaces (if there are any)
 *      and nodes with comments (if there are any):
 *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
 *      and `y` is a comment's text (without `/*` and `* /`).
 */
function getSC() {
  let sc = [];
  let ln;

  if (pos >= tokensLength) return sc;

  ln = tokens[pos].ln;

  while (pos < tokensLength) {
    if (tokens[pos].ln !== ln) break;
    else if (checkS(pos)) sc.push(getS());
    else if (checkCommentML(pos)) sc.push(getCommentML());
    else if (checkCommentSL(pos)) sc.push(getCommentSL());
    else break;

    if (tokens[pos] && tokens[pos].type === TokenType.Newline) break;
  }

  return sc;
}

/**
 * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
 *      a simple selector
 * @param {number} i Token's index number
 * @return {number}
 */
function checkShash(i) {
  var l;

  if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

  return (l = checkIdentOrInterpolation(i + 1)) ? l + 1 : 0;
}

/**
 * Get node with a hexadecimal number (e.g. `#fff`) inside a simple
 *      selector
 * @return {Array} `['shash', x]` where `x` is a hexadecimal number
 *      converted to string (without `#`, e.g. `fff`)
 */
function getShash() {
  let startPos = pos;
  var token = tokens[startPos];

  pos++;

  var x = getIdentOrInterpolation();

  return newNode(NodeType.ShashType, x, token.ln, token.col);
}

/**
 * Check if token is part of a string (text wrapped in quotes)
 * @param {number} i Token's index number
 * @return {number} `1` if token is part of a string, `0` if not
 */
function checkString(i) {
  if (i >= tokensLength) {
    return 0;
  }

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
  let startPos = pos;
  let x = tokens[pos++].value;

  var token = tokens[startPos];
  return newNode(NodeType.StringType, x, token.ln, token.col);
}

/**
 * Validate stylesheet: it should consist of any number (0 or more) of
 * rulesets (sets of rules with selectors), @-rules, whitespaces or
 * comments.
 * @param {number} i Token's index number
 * @return {number}
 */
function checkStylesheet(i) {
  let start = i;
  let l;

  while (i < tokensLength) {
    if (l = checkSC(i) ||
        checkDeclaration(i) ||
        checkDeclDelim(i) ||
        checkInclude(i) ||
        checkExtend(i) ||
        checkMixin(i) ||
        checkLoop(i) ||
        checkConditionalStatement(i) ||
        checkAtrule(i) ||
        checkRuleset(i)) i += l;
    else throwError(i);
  }

  return i - start;
}

/**
 * @return {Array} `['stylesheet', x]` where `x` is all stylesheet's
 *      nodes.
 */
function getStylesheet() {
  let startPos = pos;
  let x = [];
  var node;
  var wasDeclaration = false;

  while (pos < tokensLength) {
    if (wasDeclaration && checkDeclDelim(pos)) node = getDeclDelim();
    else if (checkSC(pos)) node = getSC();
    else if (checkRuleset(pos)) node = getRuleset();
    else if (checkInclude(pos)) node = getInclude();
    else if (checkExtend(pos)) node = getExtend();
    else if (checkMixin(pos)) node = getMixin();
    else if (checkLoop(pos)) node = getLoop();
    else if (checkConditionalStatement(pos)) node = getConditionalStatement();
    else if (checkAtrule(pos)) node = getAtrule();
    else if (checkDeclaration(pos)) node = getDeclaration();
    else throwError();

    wasDeclaration = node.type === NodeType.DeclarationType;
    if (Array.isArray(node)) x = x.concat(node);
    else x.push(node);
  }

  var token = tokens[startPos];
  return newNode(NodeType.StylesheetType, x, token.ln, token.col);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkTset(i) {
  return checkVhash(i) ||
      checkOperator(i) ||
      checkAny(i) ||
      checkSC(i) ||
      checkInterpolation(i);
}

/**
 * @return {Array}
 */
function getTset() {
  if (checkVhash(pos)) return getVhash();
  else if (checkOperator(pos)) return getOperator();
  else if (checkAny(pos)) return getAny();
  else if (checkSC(pos)) return getSC();
  else if (checkInterpolation(pos)) return getInterpolation();
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkTsets(i) {
  let start = i;
  let l;

  if (i >= tokensLength) return 0;

  while (tokens[i - 1].type !== TokenType.Newline &&
        (l = checkTset(i))) {
    i += l;
  }

  return i - start;
}

/**
 * @return {Array}
 */
function getTsets() {
  let x = [];
  let t;

  while (tokens[pos - 1].type !== TokenType.Newline &&
        (t = getTset())) {
    if (typeof t.content === 'string') x.push(t);
    else x = x.concat(t);
  }

  return x;
}

/**
 * Check if token is an unary (arithmetical) sign (`+` or `-`)
 * @param {number} i Token's index number
 * @return {number} `1` if token is an unary sign, `0` if not
 */
function checkUnary(i) {
  if (i >= tokensLength) {
    return 0;
  }

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
  let startPos = pos;
  let x = tokens[pos++].value;

  var token = tokens[startPos];
  return newNode(NodeType.OperatorType, x, token.ln, token.col);
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
 * @param {number} i Token's index number
 * @return {number} Length of URI
 */
function checkUri(i) {
  var start = i;

  if (i >= tokensLength || tokens[i++].value !== 'url' ||
      i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis)
      return 0;

  return tokens[i].right - start + 1;
}

/**
 * Get node with URI
 * @return {Array} `['uri', x]` where `x` is URI's nodes (without `url`
 *      and braces, e.g. `['string', ''/css/styles.css'']`).
 */
function getUri() {
  let startPos = pos;
  let uriExcluding = {};
  let uri;
  let token;
  let l;
  let raw;

  pos += 2;

  uriExcluding[TokenType.Space] = 1;
  uriExcluding[TokenType.Tab] = 1;
  uriExcluding[TokenType.Newline] = 1;
  uriExcluding[TokenType.LeftParenthesis] = 1;
  uriExcluding[TokenType.RightParenthesis] = 1;

  if (checkUriContent(pos)) {
    uri = []
        .concat(getSC())
        .concat(getUriContent())
        .concat(getSC());
  } else {
    uri = [].concat(getSC());
    l = checkExcluding(uriExcluding, pos);
    token = tokens[pos];
    raw = newNode(NodeType.RawType, joinValues(pos, pos + l), token.ln,
        token.col);

    uri.push(raw);

    pos += l + 1;

    uri = uri.concat(getSC());
  }

  token = tokens[startPos];
  var line = token.ln;
  var column = token.col;
  var end = getLastPosition(uri, line, column, 1);
  pos++;

  return newNode(NodeType.UriType, uri, token.ln, token.col, end);
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkUriContent(i) {
  return checkUri1(i) ||
      checkFunction(i);
}

/**
 * @return {Array}
 */
function getUriContent() {
  if (checkUri1(pos)) return getString();
  else if (checkFunction(pos)) return getFunction();
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function checkUri1(i) {
  let start = i;
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
 * @param {number} i Token's index number
 * @return {number} Length of the value
 */
function checkValue(i) {
  let start = i;
  let l;
  let s;
  let _i;

  while (i < tokensLength) {
    if (checkDeclDelim(i)) break;

    if (l = checkBlock(i)) {
      i += l;
      break;
    }

    s = checkS(i);
    _i = i + s;

    if (l = _checkValue(_i)) i += l + s;
    if (!l || checkBlock(i - l)) break;
  }

  return i - start;
}

/**
 * @param {number} i Token's index number
 * @return {number}
 */
function _checkValue(i) {
  return checkVhash(i) ||
      checkOperator(i) ||
      checkImportant(i) ||
      checkGlobal(i) ||
      checkDefault(i) ||
      checkProgid(i) ||
      checkAny(i) ||
      checkInterpolation(i) ||
      checkParentSelector(i);
}

/**
 * @return {Array}
 */
function getValue() {
  let startPos = pos;
  let x = [];
  let _pos;
  let s;

  while (pos < tokensLength) {
    if (checkDeclDelim(pos)) break;

    s = checkS(pos);
    _pos = pos + s;

    if (checkDeclDelim(_pos)) break;

    if (checkBlock(pos)) {
      x.push(getBlock());
      break;
    }

    if (!_checkValue(_pos)) break;

    if (s) x.push(getS());
    x.push(_getValue());

    if (checkBlock(_pos)) break;
  }

  var token = tokens[startPos];
  return newNode(NodeType.ValueType, x, token.ln, token.col);
}

/**
 * @return {Array}
 */
function _getValue() {
  if (checkVhash(pos)) return getVhash();
  if (checkOperator(pos)) return getOperator();
  if (checkImportant(pos)) return getImportant();
  if (checkGlobal(pos)) return getGlobal();
  if (checkDefault(pos)) return getDefault();
  if (checkProgid(pos)) return getProgid();
  if (checkAny(pos)) return getAny();
  if (checkInterpolation(pos)) return getInterpolation();
  if (checkParentSelector(pos)) return getParentSelector();
}

/**
 * Check if token is part of a variable
 * @param {number} i Token's index number
 * @return {number} Length of the variable
 */
function checkVariable(i) {
  var l;

  if (i >= tokensLength || tokens[i].type !== TokenType.DollarSign) return 0;

  return (l = checkIdent(i + 1)) ? l + 1 : 0;
}

/**
 * Get node with a variable
 * @return {Array} `['variable', ['ident', x]]` where `x` is
 *      a variable name.
 */
function getVariable() {
  let startPos = pos;
  let x = [];

  pos++;

  x.push(getIdent());

  var token = tokens[startPos];
  return newNode(NodeType.VariableType, x, token.ln, token.col);
}

/**
 * Check if token is part of a variables list (e.g. `$values...`).
 * @param {number} i Token's index number
 * @return {number}
 */
function checkVariablesList(i) {
  var d = 0; // Number of dots
  let l;

  if (i >= tokensLength) return 0;

  if (l = checkVariable(i)) i += l;
  else return 0;

  while (i < tokensLength && tokens[i].type === TokenType.FullStop) {
    d++;
    i++;
  }

  return d === 3 ? l + d : 0;
}

/**
 * Get node with a variables list
 * @return {Array} `['variableslist', ['variable', ['ident', x]]]` where
 *      `x` is a variable name.
 */
function getVariablesList() {
  let startPos = pos;
  let x = [getVariable()];
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  var end = getLastPosition(x, line, column, 3);
  pos += 3;

  return newNode(NodeType.VariablesListType, x, token.ln, token.col, end);
}

/**
 * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
 *      some value
 * @param {number} i Token's index number
 * @return {number}
 */
function checkVhash(i) {
  var l;

  if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

  return (l = checkNmName2(i + 1)) ? l + 1 : 0;
}

/**
 * Get node with a hexadecimal number (e.g. `#fff`) inside some value
 * @return {Array} `['vhash', x]` where `x` is a hexadecimal number
 *      converted to string (without `#`, e.g. `'fff'`).
 */
function getVhash() {
  let startPos = pos;
  let x;
  var token = tokens[startPos];
  var line = token.ln;
  var column = token.col;

  pos++;

  x = getNmName2();
  var end = getLastPosition(x, line, column + 1);
  return newNode(NodeType.VhashType, x, token.ln, token.col, end);
}

module.exports = function(_tokens, context) {
  tokens = _tokens;
  tokensLength = tokens.length;
  pos = 0;

  return contexts[context]();
};

function checkSelectorsGroup(i) {
  if (i >= tokensLength) return 0;

  let start = i;
  let l;


  if (l = checkSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    let sb = checkSC(i);
    let c = checkDelim(i + sb);
    if (!c) break;
    let sa = checkSLC(i + sb + c);
    let saa = sa ? checkSLC(i + sb + c + sa) : 0;
    if (l = checkSelector(i + sb + c + sa + saa)) i += sb + c + sa + saa + l;
    else break;
  }

  tokens[start].selectorsGroupEnd = i;
  return i - start;
}

function getSelectorsGroup() {
  let selectorsGroup = [];
  let selectorsGroupEnd = tokens[pos].selectorsGroupEnd;

  selectorsGroup.push(getSelector());

  while (pos < selectorsGroupEnd) {
    selectorsGroup = selectorsGroup.concat(getSLC());
    selectorsGroup.push(getDelim());
    selectorsGroup = selectorsGroup.concat(getSLC());
    selectorsGroup = selectorsGroup.concat(getSLC());
    selectorsGroup.push(getSelector());
  }

  return selectorsGroup;
}

function checkSelector(i) {
  var l;

  if (l = checkSelector1(i)) tokens[i].selectorType = 1;
  else if (l = checkSelector2(i)) tokens[i].selectorType = 2;

  return l;
}

function getSelector() {
  let selectorType = tokens[pos].selectorType;
  if (selectorType === 1) return getSelector1();
  else return getSelector2();
}

/**
 * Checks for selector which starts with a compound selector.
 */
function checkSelector1(i) {
  if (i >= tokensLength) return 0;

  let start = i;
  let l;

  if (l = checkCompoundSelector(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    let s = checkSC(i);
    let c = checkCombinator(i + s);
    if (!s && !c) break;
    if (c) {
      i += s + c;
      s = checkSC(i);
    }

    if (l = checkCompoundSelector(i + s)) i += s + l;
    else break;
  }

  tokens[start].selectorEnd = i;
  return i - start;
}

function getSelector1() {
  let type = NodeType.SelectorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let selectorEnd = token.selectorEnd;
  let content = getCompoundSelector();

  while (pos < selectorEnd) {
    if (checkSC(pos))
      content = content.concat(getSC());
    else if (checkCombinator(pos))
      content.push(getCombinator());
    else if (checkCompoundSelector(pos))
      content = content.concat(getCompoundSelector());
  }

  return newNode(type, content, line, column);
}

/**
 * Checks for a selector that starts with a combinator.
 */
function checkSelector2(i) {
  if (i >= tokensLength) return 0;

  let start = i;
  let l;

  if (l = checkCombinator(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    let sb = checkSC(i);
    if (l = checkCompoundSelector(i + sb)) i += sb + l;
    else break;

    let sa = checkSC(i);
    let c = checkCombinator(i + sa);
    if (!sa && !c) break;
    if (c) {
      i += sa + c;
    }
  }

  tokens[start].selectorEnd = i;
  return i - start;
}

function getSelector2() {
  let type = NodeType.SelectorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let selectorEnd = token.selectorEnd;
  let content = [getCombinator()];

  while (pos < selectorEnd) {
    if (checkSC(pos))
      content = content.concat(getSC());
    else if (checkCombinator(pos))
      content.push(getCombinator());
    else if (checkCompoundSelector(pos))
      content = content.concat(getCompoundSelector());
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
  let type = tokens[pos].compoundSelectorType;
  if (type === 1) return getCompoundSelector1();
  if (type === 2) return getCompoundSelector2();
}

/**
 * Check for compound selectors that start with either a type selector,
 * placeholder or parent selector with extension
 * (1) `foo.bar`
 * (2) `foo[attr=val]`
 * (3) `foo:first-of-type`
 * (4) `foo%bar`
 * @param {number} i Token's index
 * @return {number} Compound selector's length
 */
function checkCompoundSelector1(i) {
  if (i >= tokensLength) return 0;

  let start = i;
  let l;

  if (l = checkTypeSelector(i) ||
      checkPlaceholder(i) ||
      checkParentSelectorWithExtension(i)) i += l;
  else return 0;

  while (i < tokensLength) {
    let l = checkShash(i) ||
        checkClass(i) ||
        checkAttributeSelector(i) ||
        checkPseudo(i) ||
        checkPlaceholder(i);

    if (l) i += l;
    else break;
  }

  tokens[start].compoundSelectorEnd = i;

  return i - start;
}

/**
 * @return {Array} An array of nodes that make up the compound selector
 */
function getCompoundSelector1() {
  let sequence = [];
  let compoundSelectorEnd = tokens[pos].compoundSelectorEnd;

  if (checkTypeSelector(pos)) sequence.push(getTypeSelector());
  else if (checkPlaceholder(pos)) sequence.push(getPlaceholder());
  else if (checkParentSelectorWithExtension(pos))
    sequence = sequence.concat(getParentSelectorWithExtension());

  while (pos < compoundSelectorEnd) {
    if (checkShash(pos)) sequence.push(getShash());
    else if (checkClass(pos)) sequence.push(getClass());
    else if (checkAttributeSelector(pos)) sequence.push(getAttributeSelector());
    else if (checkPseudo(pos)) sequence.push(getPseudo());
    else if (checkPlaceholder(pos)) sequence.push(getPlaceholder());
    else break;
  }

  return sequence;
}

/**
 * Check for all other compound selectors
 * (1) `.foo.bar`
 * (2) `.foo[attr=val]`
 * (3) `.foo:first-of-type`
 * (4) `.foo%bar`
 * (5) `.foo#{$bar}`
 * @param {number} i Token's index
 * @return {number} Compound selector's length
 */
function checkCompoundSelector2(i) {
  if (i >= tokensLength) return 0;

  let start = i;

  while (i < tokensLength) {
    let l = checkShash(i) ||
        checkClass(i) ||
        checkAttributeSelector(i) ||
        checkPseudo(i) ||
        checkPlaceholder(i) ||
        checkInterpolation(i);

    if (l) i += l;
    else break;
  }

  tokens[start].compoundSelectorEnd = i;

  return i - start;
}

/**
 * @return {Array} An array of nodes that make up the compound selector
 */
function getCompoundSelector2() {
  let sequence = [];
  let compoundSelectorEnd = tokens[pos].compoundSelectorEnd;

  while (pos < compoundSelectorEnd) {
    if (checkShash(pos)) sequence.push(getShash());
    else if (checkClass(pos)) sequence.push(getClass());
    else if (checkAttributeSelector(pos)) sequence.push(getAttributeSelector());
    else if (checkPseudo(pos)) sequence.push(getPseudo());
    else if (checkPlaceholder(pos)) sequence.push(getPlaceholder());
    else if (checkInterpolation(pos)) sequence.push(getInterpolation());
    else break;
  }

  return sequence;
}

function checkTypeSelector(i) {
  if (i >= tokensLength) return 0;

  let start = i;
  let l;

  if (l = checkNamePrefix(i)) i += l;

  if (tokens[i].type === TokenType.Asterisk) i++;
  else if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

function getTypeSelector() {
  let type = NodeType.TypeSelectorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  if (checkNamePrefix(pos)) content.push(getNamePrefix());
  if (checkIdentOrInterpolation(pos))
    content = content.concat(getIdentOrInterpolation());

  return newNode(type, content, line, column);
}

function checkAttributeSelector(i) {
  let l;
  if (l = checkAttributeSelector1(i)) tokens[i].attributeSelectorType = 1;
  else if (l = checkAttributeSelector2(i)) tokens[i].attributeSelectorType = 2;

  return l;
}

function getAttributeSelector() {
  let type = tokens[pos].attributeSelectorType;
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
  let start = i;

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
  let type = NodeType.AttributeSelectorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  // Skip `[`.
  pos++;

  content = content.concat(getSC());
  content.push(getAttributeName());
  content = content.concat(getSC());
  content.push(getAttributeMatch());
  content = content.concat(getSC());
  content.push(getAttributeValue());
  content = content.concat(getSC());

  if (checkAttributeFlags(pos)) {
    content.push(getAttributeFlags());
    content = content.concat(getSC());
  }

  // Skip `]`.
  pos++;

  let end = getLastPosition(content, line, column, 1);
  return newNode(type, content, line, column, end);
}

/**
 * (1) `[panda]`
 */
function checkAttributeSelector2(i) {
  let start = i;

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
  let type = NodeType.AttributeSelectorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  // Skip `[`.
  pos++;

  content = content.concat(getSC());
  content.push(getAttributeName());
  content = content.concat(getSC());

  // Skip `]`.
  pos++;

  let end = getLastPosition(content, line, column, 1);
  return newNode(type, content, line, column, end);
}

function checkAttributeName(i) {
  let start = i;
  let l;

  if (l = checkNamePrefix(i)) i += l;

  if (l = checkIdentOrInterpolation(i)) i += l;
  else return 0;

  return i - start;
}

function getAttributeName() {
  let type = NodeType.AttributeNameType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  if (checkNamePrefix(pos)) content.push(getNamePrefix());
  content = content.concat(getIdentOrInterpolation());

  return newNode(type, content, line, column);
}

function checkAttributeMatch(i) {
  let l;
  if (l = checkAttributeMatch1(i)) tokens[i].attributeMatchType = 1;
  else if (l = checkAttributeMatch2(i)) tokens[i].attributeMatchType = 2;

  return l;
}

function getAttributeMatch() {
  let type = tokens[pos].attributeMatchType;
  if (type === 1) return getAttributeMatch1();
  else return getAttributeMatch2();
}

function checkAttributeMatch1(i) {
  let start = i;

  let type = tokens[i].type;
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
  let type = NodeType.AttributeMatchType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = tokens[pos].value + tokens[pos + 1].value;
  pos += 2;

  return newNode(type, content, line, column);
}

function checkAttributeMatch2(i) {
  if (tokens[i].type === TokenType.EqualsSign) return 1;
  else return 0;
}

function getAttributeMatch2() {
  let type = NodeType.AttributeMatchType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = '=';

  pos++;
  return newNode(type, content, line, column);
}

function checkAttributeValue(i) {
  return checkString(i) || checkIdentOrInterpolation(i);
}

function getAttributeValue() {
  let type = NodeType.AttributeValueType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

  if (checkString(pos)) content.push(getString());
  else content = content.concat(getIdentOrInterpolation());

  return newNode(type, content, line, column);
}

function checkAttributeFlags(i) {
  return checkIdentOrInterpolation(i);
}

function getAttributeFlags() {
  let type = NodeType.AttributeFlagsType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = getIdentOrInterpolation();

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
  let type = tokens[pos].namePrefixType;
  if (type === 1) return getNamePrefix1();
  else return getNamePrefix2();
}

/**
 * (1) `panda|`
 * (2) `panda<comment>|`
 */
function checkNamePrefix1(i) {
  let start = i;
  let l;

  if (l = checkNamespacePrefix(i)) i += l;
  else return 0;

  if (l = checkCommentML(i)) i += l;

  if (l = checkNamespaceSeparator(i)) i += l;
  else return 0;

  return i - start;
}

function getNamePrefix1() {
  let type = NodeType.NamePrefixType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];

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
  let type = NodeType.NamePrefixType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [getNamespaceSeparator()];

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
  else if (l = checkIdentOrInterpolation(i)) return l;
  else return 0;
}

function getNamespacePrefix() {
  let type = NodeType.NamespacePrefixType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = [];
  if (checkIdentOrInterpolation(pos))
    content = content.concat(getIdentOrInterpolation());

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
  let type = NodeType.NamespaceSeparatorType;
  let token = tokens[pos];
  let line = token.ln;
  let column = token.col;
  let content = '|';

  pos++;
  return newNode(type, content, line, column);
}
