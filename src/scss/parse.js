// jscs:disable maximumLineLength

'use strict';

var Node = require('../node/basic-node');
var NodeType = require('../node/node-types');
var TokenType = require('../token-types');

module.exports = (function() {
  let tokens;
  let tokensLength;
  let pos;
  let needInfo;

  var rules = {
    'arguments': function() { return checkArguments(pos) && getArguments(); },
    'atkeyword': function() { return checkAtkeyword(pos) && getAtkeyword(); },
    'atruleb': function() { return checkAtruleb(pos) && getAtruleb(); },
    'atruler': function() { return checkAtruler(pos) && getAtruler(); },
    'atrulerq': function() { return checkAtrulerq(pos) && getAtrulerq(); },
    'atrulers': function() { return checkAtrulers(pos) && getAtrulers(); },
    'atrules': function() { return checkAtrules(pos) && getAtrules(); },
    'attrib': function() { return checkAttrib(pos) && getAttrib(); },
    'attrselector': function() { return checkAttrselector(pos) && getAttrselector(); },
    'block': function() { return checkBlock(pos) && getBlock(); },
    'brackets': function() { return checkBrackets(pos) && getBrackets(); },
    'class': function() { return checkClass(pos) && getClass(); },
    'combinator': function() { return checkCombinator(pos) && getCombinator(); },
    'commentML': function() { return checkCommentML(pos) && getCommentML(); },
    'commentSL': function() { return checkCommentSL(pos) && getCommentSL(); },
    'condition': function() { return checkCondition(pos) && getCondition(); },
    'conditionalStatement': function() { return checkConditionalStatement(pos) && getConditionalStatement(); },
    'declaration': function() { return checkDeclaration(pos) && getDeclaration(); },
    'declDelim': function() { return checkDeclDelim(pos) && getDeclDelim(); },
    'default': function() { return checkDefault(pos) && getDefault(); },
    'delim': function() { return checkDelim(pos) && getDelim(); },
    'dimension': function() { return checkDimension(pos) && getDimension(); },
    'expression': function() { return checkExpression(pos) && getExpression(); },
    'extend': function() { return checkExtend(pos) && getExtend(); },
    'function': function() { return checkFunction(pos) && getFunction(); },
    'global': function() { return checkGlobal(pos) && getGlobal(); },
    'ident': function() { return checkIdent(pos) && getIdent(); },
    'important': function() { return checkImportant(pos) && getImportant(); },
    'include': function() { return checkInclude(pos) && getInclude(); },
    'interpolation': function() { return checkInterpolation(pos) && getInterpolation(); },
    'loop': function() { return checkLoop(pos) && getLoop(); },
    'mixin': function() { return checkMixin(pos) && getMixin(); },
    'namespace': function() { return checkNamespace(pos) && getNamespace(); },
    'nth': function() { return checkNth(pos) && getNth(); },
    'nthselector': function() { return checkNthselector(pos) && getNthselector(); },
    'number': function() { return checkNumber(pos) && getNumber(); },
    'operator': function() { return checkOperator(pos) && getOperator(); },
    'optional': function() { return checkOptional(pos) && getOptional(); },
    'parentheses': function() { return checkParentheses(pos) && getParentheses(); },
    'parentselector': function() { return checkParentSelector(pos) && getParentSelector(); },
    'percentage': function() { return checkPercentage(pos) && getPercentage(); },
    'placeholder': function() { return checkPlaceholder(pos) && getPlaceholder(); },
    'progid': function() { return checkProgid(pos) && getProgid(); },
    'property': function() { return checkProperty(pos) && getProperty(); },
    'propertyDelim': function() { return checkPropertyDelim(pos) && getPropertyDelim(); },
    'pseudoc': function() { return checkPseudoc(pos) && getPseudoc(); },
    'pseudoe': function() { return checkPseudoe(pos) && getPseudoe(); },
    'ruleset': function() { return checkRuleset(pos) && getRuleset(); },
    's': function() { return checkS(pos) && getS(); },
    'selector': function() { return checkSelector(pos) && getSelector(); },
    'shash': function() { return checkShash(pos) && getShash(); },
    'simpleselector': function() { return checkSimpleSelector(pos) && getSimpleSelector(); },
    'string': function() { return checkString(pos) && getString(); },
    'stylesheet': function() { return checkStylesheet(pos) && getStylesheet(); },
    'unary': function() { return checkUnary(pos) && getUnary(); },
    'uri': function() { return checkUri(pos) && getUri(); },
    'value': function() { return checkValue(pos) && getValue(); },
    'variable': function() { return checkVariable(pos) && getVariable(); },
    'variableslist': function() { return checkVariablesList(pos) && getVariablesList(); },
    'vhash': function() { return checkVhash(pos) && getVhash(); }
  };

  /**
   * Stop parsing and display error
   * @param {Number=} i Token's index number
   */
  function throwError(i) {
    var ln = i ? tokens[i].ln : tokens[pos].ln;

    throw {line: ln, syntax: 'scss'};
  }

  /**
   * @param {Object} exclude
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkExcluding(exclude, i) {
    var start = i;

    while (i < tokensLength) {
      if (exclude[tokens[i++].type]) break;
    }

    return i - start - 2;
  }

  /**
   * @param {Number} start
   * @param {Number} finish
   * @returns {String}
   */
  function joinValues(start, finish) {
    var s = '';

    for (var i = start; i < finish + 1; i++) {
      s += tokens[i].value;
    }

    return s;
  }

  /**
   * @param {Number} start
   * @param {Number} num
   * @returns {String}
   */
  function joinValues2(start, num) {
    if (start + num - 1 >= tokensLength) return;

    var s = '';

    for (var i = 0; i < num; i++) {
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
      syntax: 'scss'
    });
  }



  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAny(i) {
    return checkBrackets(i) ||
        checkParentheses(i) ||
        checkString(i) ||
        checkVariablesList(i) ||
        checkVariable(i) ||
        checkPlaceholder(i) ||
        checkPercentage(i) ||
        checkDimension(i) ||
        checkNumber(i) ||
        checkUri(i) ||
        checkExpression(i) ||
        checkFunction(i) ||
        checkInterpolation(i) ||
        checkIdent(i) ||
        checkClass(i) ||
        checkUnary(i);
  }

  /**
   * @returns {Array}
   */
  function getAny() {
    if (checkBrackets(pos)) return getBrackets();
    else if (checkParentheses(pos)) return getParentheses();
    else if (checkString(pos)) return getString();
    else if (checkVariablesList(pos)) return getVariablesList();
    else if (checkVariable(pos)) return getVariable();
    else if (checkPlaceholder(pos)) return getPlaceholder();
    else if (checkPercentage(pos)) return getPercentage();
    else if (checkDimension(pos)) return getDimension();
    else if (checkNumber(pos)) return getNumber();
    else if (checkUri(pos)) return getUri();
    else if (checkExpression(pos)) return getExpression();
    else if (checkFunction(pos)) return getFunction();
    else if (checkInterpolation(pos)) return getInterpolation();
    else if (checkIdent(pos)) return getIdent();
    else if (checkClass(pos)) return getClass();
    else if (checkUnary(pos)) return getUnary();
  }

  /**
   * Check if token is part of mixin's arguments.
   * @param {Number} i Token's index number
   * @returns {Number} Length of arguments
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
   * Check if token is valid to be part of arguments list
   * @param {Number} i Token's index number
   * @returns {Number} Length of argument
   */
  function checkArgument(i) {
    return checkBrackets(i) ||
        checkParentheses(i) ||
        checkDeclaration(i) ||
        checkFunction(i) ||
        checkVariablesList(i) ||
        checkVariable(i) ||
        checkSC(i) ||
        checkDelim(i) ||
        checkDeclDelim(i) ||
        checkString(i) ||
        checkPercentage(i) ||
        checkDimension(i) ||
        checkNumber(i) ||
        checkUri(i) ||
        checkInterpolation(i) ||
        checkIdent(i) ||
        checkVhash(i) ||
        checkOperator(i) ||
        checkUnary(i);
  }

  /**
   * @returns {Array} Node that is part of arguments list
   */
  function getArgument() {
    if (checkBrackets(pos)) return getBrackets();
    else if (checkParentheses(pos)) return getParentheses();
    else if (checkDeclaration(pos)) return getDeclaration();
    else if (checkFunction(pos)) return getFunction();
    else if (checkVariablesList(pos)) return getVariablesList();
    else if (checkVariable(pos)) return getVariable();
    else if (checkSC(pos)) return getSC();
    else if (checkDelim(pos)) return getDelim();
    else if (checkDeclDelim(pos)) return getDeclDelim();
    else if (checkString(pos)) return getString();
    else if (checkPercentage(pos)) return getPercentage();
    else if (checkDimension(pos)) return getDimension();
    else if (checkNumber(pos)) return getNumber();
    else if (checkUri(pos)) return getUri();
    else if (checkInterpolation(pos)) return getInterpolation();
    else if (checkIdent(pos)) return getIdent();
    else if (checkVhash(pos)) return getVhash();
    else if (checkOperator(pos)) return getOperator();
    else if (checkUnary(pos)) return getUnary();
  }

  /**
   * Check if token is part of an @-word (e.g. `@import`, `@include`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAtkeyword(i) {
    var l;

    // Check that token is `@`:
    if (i >= tokensLength ||
        tokens[i++].type !== TokenType.CommercialAt) return 0;

    return (l = checkIdentOrInterpolation(i)) ? l + 1 : 0;
  }

  /**
   * Get node with @-word
   * @returns {Array} `['atkeyword', ['ident', x]]` where `x` is
   *      an identifier without
   *      `@` (e.g. `import`, `include`)
   */
  function getAtkeyword() {
    let startPos = pos;
    let x;

    pos++;

    x = getIdentOrInterpolation();

    var token = tokens[startPos];
    return newNode(NodeType.AtkeywordType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of an attribute selector (e.g. `[attr]`,
   *      `[attr='panda']`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAttrib(i) {
    if (i >= tokensLength ||
        tokens[i].type !== TokenType.LeftSquareBracket ||
        !tokens[i].right) return 0;

    return tokens[i].right - i + 1;
  }

  /**
  * Get node with an attribute selector
  * @returns {Array} `['attrib', ['ident', x], ['attrselector', y]*, [z]*]`
  *      where `x` is attribute's name, `y` is operator (if there is any)
  *      and `z` is attribute's value (if there is any)
  */
  function getAttrib() {
    if (checkAttrib1(pos)) return getAttrib1();
    if (checkAttrib2(pos)) return getAttrib2();
  }

  /**
   * Check if token is part of an attribute selector of the form `[attr='value']`
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAttrib1(i) {
    let start = i;
    let l;

    if (i++ >= tokensLength) return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkIdentOrInterpolation(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkAttrselector(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkIdentOrInterpolation(i) || checkString(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].type === TokenType.RightSquareBracket ? i - start : 0;
  }

  /**
   * Get node with an attribute selector of the form `[attr='value']`
   * @returns {Array} `['attrib', ['ident', x], ['attrselector', y], [z]]`
   *      where `x` is attribute's name, `y` is operator and `z` is attribute's
   *      value
   */
  function getAttrib1() {
    let startPos = pos;
    let x;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    x = []
        .concat(getSC())
        .concat(getIdentOrInterpolation())
        .concat(getSC())
        .concat([getAttrselector()])
        .concat(getSC());
    if (checkString(pos)) {
      x.push(getString());
    } else {
      x = x.concat(getIdentOrInterpolation());
    }
    x = x.concat(getSC());

    var end = getLastPosition(x, line, column + 1, 1);
    pos++;

    return newNode(NodeType.AttribType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of an attribute selector of the form `[attr]`
   * Attribute can not be empty, e.g. `[]`.
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAttrib2(i) {
    let start = i;
    let l;

    if (i++ >= tokensLength) return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkIdentOrInterpolation(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].type === TokenType.RightSquareBracket ? i - start : 0;
  }

  /**
   * Get node with an attribute selector of the form `[attr]`
   * @returns {Array} `['attrib', ['ident', x]]` where `x` is attribute's name
   */
  function getAttrib2() {
    let startPos = pos;
    let x;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    x = []
        .concat(getSC())
        .concat(getIdentOrInterpolation())
        .concat(getSC());

    var end = getLastPosition(x, line, column + 1, 1);
    pos++;

    return newNode(NodeType.AttribType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of an attribute selector operator (`=`, `~=`,
   *      `^=`, `$=`, `*=` or `|=`)
   * @param {Number} i Token's index number
   * @returns {Number} Length of operator (`0` if token is not part of an
   *       operator, `1` or `2` if it is).
   */
  function checkAttrselector(i) {
    if (i >= tokensLength) return 0;

    if (tokens[i].type === TokenType.EqualsSign) return 1;

    // TODO: Add example or remove
    if (tokens[i].type === TokenType.VerticalLine &&
        (!tokens[i + 1] || tokens[i + 1].type !== TokenType.EqualsSign))
        return 1;

    if (!tokens[i + 1] || tokens[i + 1].type !== TokenType.EqualsSign) return 0;

    switch (tokens[i].type) {
      case TokenType.Tilde:
      case TokenType.CircumflexAccent:
      case TokenType.DollarSign:
      case TokenType.Asterisk:
      case TokenType.VerticalLine:
        return 2;
    }

    return 0;
  }

  /**
   * Get node with an attribute selector operator (`=`, `~=`, `^=`, `$=`,
   *      `*=` or `|=`)
   * @returns {Array} `['attrselector', x]` where `x` is an operator.
   */
  function getAttrselector() {
    let startPos = pos;
    let s = tokens[pos++].value;

    if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign) s += tokens[pos++].value;

    var token = tokens[startPos];
    return newNode(NodeType.AttrselectorType, s, token.ln, token.col);
  }

  /**
   * Check if token is a part of an @-rule
   * @param {Number} i Token's index number
   * @returns {Number} Length of @-rule
   */
  function checkAtrule(i) {
    var l;

    if (i >= tokensLength) return 0;

    // If token already has a record of being part of an @-rule,
    // return the @-rule's length:
    if (tokens[i].atrule_l !== undefined) return tokens[i].atrule_l;

    // If token is part of an @-rule, save the rule's type to token:
    if (l = checkAtruler(i)) tokens[i].atrule_type = 1; // @-rule with ruleset
    else if (l = checkAtruleb(i)) tokens[i].atrule_type = 2; // Block @-rule
    else if (l = checkAtrules(i)) tokens[i].atrule_type = 3; // Single-line @-rule
    else return 0;

    // If token is part of an @-rule, save the rule's length to token:
    tokens[i].atrule_l = l;

    return l;
  }

  /**
   * Get node with @-rule
   * @returns {Array}
   */
  function getAtrule() {
    switch (tokens[pos].atrule_type) {
      case 1: return getAtruler(); // @-rule with ruleset
      case 2: return getAtruleb(); // Block @-rule
      case 3: return getAtrules(); // Single-line @-rule
    }
  }

  /**
   * Check if token is part of a block @-rule
   * @param {Number} i Token's index number
   * @returns {Number} Length of the @-rule
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
   * Get node with a block @-rule
   * @returns {Array} `['atruleb', ['atkeyword', x], y, ['block', z]]`
   */
  function getAtruleb() {
    let startPos = pos;
    let x;

    x = [getAtkeyword()]
        .concat(getTsets())
        .concat([getBlock()]);

    var token = tokens[startPos];
    return newNode(NodeType.AtrulebType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of an @-rule with ruleset
   * @param {Number} i Token's index number
   * @returns {Number} Length of the @-rule
   */
  function checkAtruler(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (l = checkAtkeyword(i)) i += l;
    else return 0;

    if (l = checkAtrulerq(i)) i += l;

    if (i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket) i++;
    else return 0;

    if (l = checkAtrulers(i)) i += l;

    if (i < tokensLength && tokens[i].type === TokenType.RightCurlyBracket) i++;
    else return 0;

    return i - start;
  }

  /**
   * Get node with an @-rule with ruleset
   * @returns {Array} ['atruler', ['atkeyword', x], y, z]
   */
  function getAtruler() {
    let startPos = pos;
    let x;

    x = [getAtkeyword(), getAtrulerq()];

    x.push(getAtrulers());

    var token = tokens[startPos];
    return newNode(NodeType.AtrulerType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAtrulerq(i) {
    return checkTsets(i);
  }

  /**
   * @returns {Array} `['atrulerq', x]`
   */
  function getAtrulerq() {
    let startPos = pos;
    let x;

    x = getTsets();

    var token = tokens[startPos];
    return newNode(NodeType.AtrulerqType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkAtrulers(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (l = checkSC(i)) i += l;

    while (l = checkRuleset(i) || checkAtrule(i) || checkSC(i)) {
      i += l;
    }

    tokens[i].atrulers_end = 1;

    if (l = checkSC(i)) i += l;

    return i - start;
  }

  /**
   * @returns {Array} `['atrulers', x]`
   */
  function getAtrulers() {
    let startPos = pos;
    let x;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;
    pos++;

    x = getSC();

    while (!tokens[pos].atrulers_end) {
      if (checkSC(pos)) x = x.concat(getSC());
      else if (checkAtrule(pos)) x.push(getAtrule());
      else if (checkRuleset(pos)) x.push(getRuleset());
    }

    x = x.concat(getSC());

    var end = getLastPosition(x, line, column, 1);
    pos++;

    return newNode(NodeType.AtrulersType, x, token.ln, token.col, end);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
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
   * @returns {Array} `['atrules', ['atkeyword', x], y]`
   */
  function getAtrules() {
    let startPos = pos;
    let x;

    x = [getAtkeyword()].concat(getTsets());

    var token = tokens[startPos];
    return newNode(NodeType.AtrulesType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of a block (e.g. `{...}`).
   * @param {Number} i Token's index number
   * @returns {Number} Length of the block
   */
  function checkBlock(i) {
    return i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket ?
        tokens[i].right - i + 1 : 0;
  }

  /**
   * Get node with a block
   * @returns {Array} `['block', x]`
   */
  function getBlock() {
    let startPos = pos;
    let end = tokens[pos].right;
    let x = [];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;


    while (pos < end) {
      if (checkBlockdecl(pos)) x = x.concat(getBlockdecl());
      else throwError();
    }

    var end_ = getLastPosition(x, line, column, 1);
    pos = end + 1;

    return newNode(NodeType.BlockType, x, token.ln, token.col, end_);
  }

  /**
   * Check if token is part of a declaration (property-value pair)
   * @param {Number} i Token's index number
   * @returns {Number} Length of the declaration
   */
  function checkBlockdecl(i) {
    var l;

    if (i >= tokensLength) return 0;

    if (l = checkBlockdecl1(i)) tokens[i].bd_type = 1;
    else if (l = checkBlockdecl2(i)) tokens[i].bd_type = 2;
    else if (l = checkBlockdecl3(i)) tokens[i].bd_type = 3;
    else if (l = checkBlockdecl4(i)) tokens[i].bd_type = 4;
    else return 0;

    return l;
  }

  /**
   * @returns {Array}
   */
  function getBlockdecl() {
    switch (tokens[pos].bd_type) {
      case 1: return getBlockdecl1();
      case 2: return getBlockdecl2();
      case 3: return getBlockdecl3();
      case 4: return getBlockdecl4();
    }
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkBlockdecl1(i) {
    let start = i;
    let l;

    if (l = checkSC(i)) i += l;

    if (l = checkConditionalStatement(i)) tokens[i].bd_kind = 1;
    else if (l = checkInclude(i)) tokens[i].bd_kind = 2;
    else if (l = checkExtend(i)) tokens[i].bd_kind = 4;
    else if (l = checkLoop(i)) tokens[i].bd_kind = 3;
    else if (l = checkAtrule(i)) tokens[i].bd_kind = 6;
    else if (l = checkRuleset(i)) tokens[i].bd_kind = 7;
    else if (l = checkDeclaration(i)) tokens[i].bd_kind = 5;
    else return 0;

    i += l;

    if (i < tokensLength && (l = checkDeclDelim(i))) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getBlockdecl1() {
    let sc = getSC();
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

    return sc
        .concat([x])
        .concat([getDeclDelim()])
        .concat(getSC());
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkBlockdecl2(i) {
    let start = i;
    let l;

    if (l = checkSC(i)) i += l;

    if (l = checkConditionalStatement(i)) tokens[i].bd_kind = 1;
    else if (l = checkInclude(i)) tokens[i].bd_kind = 2;
    else if (l = checkExtend(i)) tokens[i].bd_kind = 4;
    else if (l = checkLoop(i)) tokens[i].bd_kind = 3;
    else if (l = checkAtrule(i)) tokens[i].bd_kind = 6;
    else if (l = checkRuleset(i)) tokens[i].bd_kind = 7;
    else if (l = checkDeclaration(i)) tokens[i].bd_kind = 5;
    else return 0;

    i += l;

    if (l = checkSC(i)) i += l;

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getBlockdecl2() {
    let sc = getSC();
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

    return sc
        .concat([x])
        .concat(getSC());
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkBlockdecl3(i) {
    let start = i;
    let l;

    if (l = checkSC(i)) i += l;

    if (l = checkDeclDelim(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    return i - start;
  }

  /**
   * @returns {Array} `[s0, ['declDelim'], s1]` where `s0` and `s1` are
   *      are optional whitespaces.
   */
  function getBlockdecl3() {
    return getSC()
        .concat([getDeclDelim()])
        .concat(getSC());
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkBlockdecl4(i) {
    return checkSC(i);
  }

  /**
   * @returns {Array}
   */
  function getBlockdecl4() {
    return getSC();
  }

  /**
   * Check if token is part of text inside square brackets, e.g. `[1]`
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkBrackets(i) {
    if (i >= tokensLength ||
        tokens[i].type !== TokenType.LeftSquareBracket) return 0;

    return tokens[i].right - i + 1;
  }

  /**
   * Get node with text inside parentheses or square brackets (e.g. `(1)`)
   * @return {Node}
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
   * Check if token is part of a class selector (e.g. `.abc`)
   * @param {Number} i Token's index number
   * @returns {Number} Length of the class selector
   */
  function checkClass(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (tokens[i].class_l) return tokens[i].class_l;

    if (tokens[i++].type !== TokenType.FullStop) return 0;

    if (l = checkIdentOrInterpolation(i)) i += l;
    else return 0;

    return i - start;
  }

  /**
   * Get node with a class selector
   * @returns {Array} `['class', ['ident', x]]` where x is a class's
   *      identifier (without `.`, e.g. `abc`).
   */
  function getClass() {
    let startPos = pos;
    let x = [];

    pos++;

    x = x.concat(getIdentOrInterpolation());

    var token = tokens[startPos];
    return newNode(NodeType.ClassType, x, token.ln, token.col);
  }

  /**
   * Check if token is a combinator (`+`, `>` or `~`)
   * @param {Number} i Token's index number
   * @returns {Number} Length of the combinator
   */
  function checkCombinator(i) {
    if (i >= tokensLength) return 0;

    switch (tokens[i].type) {
      case TokenType.PlusSign:
      case TokenType.GreaterThanSign:
      case TokenType.Tilde:
        return 1;
    }

    return 0;
  }

  /**
   * Get node with a combinator (`+`, `>` or `~`)
   * @returns {Array} `['combinator', x]` where `x` is a combinator
   *      converted to string.
   */
  function getCombinator() {
    let startPos = pos;
    let x;

    x = tokens[pos++].value;

    var token = tokens[startPos];
    return newNode(NodeType.CombinatorType, x, token.ln, token.col);
  }

  /**
   * Check if token is a multiline comment.
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is a multiline comment, otherwise `0`
   */
  function checkCommentML(i) {
    return i < tokensLength && tokens[i].type === TokenType.CommentML ? 1 : 0;
  }

  /**
   * Get node with a multiline comment
   * @returns {Array} `['commentML', x]` where `x`
   *      is the comment's text (without `/*` and `* /`).
   */
  function getCommentML() {
    let startPos = pos;
    let s = tokens[pos].value.substring(2);
    let l = s.length;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/')
        s = s.substring(0, l - 2);

    var end = getLastPosition(s, line, column, 2);
    if (end[0] === line) end[1] += 2;
    pos++;

    return newNode(NodeType.CommentMLType, s, token.ln, token.col, end);
  }

  /**
   * Check if token is part of a single-line comment.
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is a single-line comment, otherwise `0`
   */
  function checkCommentSL(i) {
    return i < tokensLength && tokens[i].type === TokenType.CommentSL ? 1 : 0;
  }

  /**
   * Get node with a single-line comment.
   * @returns {Array} `['commentSL', x]` where `x` is comment's message
   *      (without `//`)
   */
  function getCommentSL() {
    let startPos = pos;
    let x;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    x = tokens[pos++].value.substring(2);
    var end = getLastPosition(x, line, column + 2);

    return newNode(NodeType.CommentSLType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of a condition
   * (e.g. `@if ...`, `@else if ...` or `@else ...`).
   * @param {Number} i Token's index number
   * @returns {Number} Length of the condition
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
   * @returns {Array} `['condition', x]`
   */
  function getCondition() {
    let startPos = pos;
    let x = [];
    var s;
    var _pos;

    x.push(getAtkeyword());

    while (pos < tokensLength) {
      if (checkBlock(pos)) break;

      s = checkSC(pos);
      _pos = pos + s;

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
   * @param {Number} i Token's index number
   * @returns {Number} Length of the condition
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
   * @returns {Array} `['condition', x]`
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
   * @param {Number} i Token's index number
   * @returns {Number} Length of the declaration
   */
  function checkDeclaration(i) {
    let start = i;
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
   * @returns {Array} `['declaration', ['property', x], ['propertyDelim'],
   *       ['value', y]]`
   */
  function getDeclaration() {
    let startPos = pos;
    let x = [];

    x.push(getProperty());
    x = x.concat(getSC());
    x.push(getPropertyDelim());
    x = x.concat(getSC());
    x.push(getValue());

    var token = tokens[startPos];
    return newNode(NodeType.DeclarationType, x, token.ln, token.col);
  }

  /**
   * Check if token is a semicolon
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is a semicolon, otherwise `0`
   */
  function checkDeclDelim(i) {
    return i < tokensLength && tokens[i].type === TokenType.Semicolon ? 1 : 0;
  }

  /**
   * Get node with a semicolon
   * @returns {Array} `['declDelim']`
   */
  function getDeclDelim() {
    var startPos = pos++;

    var token = tokens[startPos];
    return newNode(NodeType.DeclDelimType, ';', token.ln, token.col);
  }

  function checkDeepSelector(i) {
    if (tokens[i + 2] &&
        tokens[i].value + tokens[i + 1].value + tokens[i + 2].value === '/deep/') {
      return 3;
    }
  }

  function getDeepSelector() {
    var _pos = pos++;
    var ident = getIdent();
    ident.content = '/deep/';
    ident.start.column -= 1;
    ident.end.column += 4;
    pos = _pos + 3;
    return ident;
  }

  /**
   * Check if token if part of `!default` word.
   * @param {Number} i Token's index number
   * @returns {Number} Length of the `!default` word
   */
  function checkDefault(i) {
    let start = i;
    let l;

    if (i >= tokensLength ||
        tokens[i++].type !== TokenType.ExclamationMark) return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].value === 'default' ? i - start + 1 : 0;
  }

  /**
   * Get node with a `!default` word
   * @returns {Array} `['default', sc]` where `sc` is optional whitespace
   */
  function getDefault() {
    let startPos = pos;
    let sc;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    // Skip `!`:
    pos++;

    sc = getSC();
    var end = getLastPosition(sc, line, column, 7);

    // Skip `default`:
    pos++;

    var x = sc.length ? sc : [];

    return newNode(NodeType.DefaultType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is a comma
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is a comma, otherwise `0`
   */
  function checkDelim(i) {
    return i < tokensLength && tokens[i].type === TokenType.Comma ? 1 : 0;
  }

  /**
   * Get node with a comma
   * @returns {Array} `['delim']`
   */
  function getDelim() {
    var startPos = pos;

    pos++;

    var token = tokens[startPos];
    return newNode(NodeType.DelimType, ',', token.ln, token.col);
  }

  /**
   * Check if token is part of a number with dimension unit (e.g. `10px`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkDimension(i) {
    let ln = checkNumber(i);
    let li;

    if (i >= tokensLength ||
        !ln ||
        i + ln >= tokensLength) return 0;

    return (li = checkNmName2(i + ln)) ? ln + li : 0;
  }

  /**
   * Get node of a number with dimension unit
   * @returns {Array} `['dimension', ['number', x], ['ident', y]]` where
   *      `x` is a number converted to string (e.g. `'10'`) and `y` is
   *      a dimension unit (e.g. `'px'`).
   */
  function getDimension() {
    let startPos = pos;
    let x = [getNumber()];
    let token = tokens[pos];
    let ident = newNode(NodeType.IdentType, getNmName2(), token.ln, token.col);

    x.push(ident);

    token = tokens[startPos];
    return newNode(NodeType.DimensionType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkExpression(i) {
    var start = i;

    if (i >= tokensLength || tokens[i++].value !== 'expression' ||
        i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis) return 0;

    return tokens[i].right - start + 1;
  }

  /**
   * @returns {Array}
   */
  function getExpression() {
    var startPos = pos;
    var e;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    e = joinValues(pos + 1, tokens[pos].right - 1);
    var end = getLastPosition(e, line, column, 1);
    if (end[0] === line) end[1] += 11;
    pos = tokens[pos].right + 1;

    return newNode(NodeType.ExpressionType, e, token.ln, token.col, end);
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
   * @param {Number} i
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

    if (l = checkIncludeSelector(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;
    else return 0;

    if (l = checkOptional(i)) i += l;
    else return 0;

    return i - start;
  }

  function getExtend1() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    // `@include` and `@extend` have the same type of valid selectors.
    x.push(getIncludeSelector());

    x = x.concat(getSC());

    x.push(getOptional());

    var token = tokens[startPos];
    return newNode(NodeType.ExtendType, x, token.ln, token.col);
  }

  /**
   * Checks if token is part of an extend without `!optional` flag.
   * @param {Number} i
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

    if (l = checkIncludeSelector(i)) i += l;
    else return 0;

    return i - start;
  }

  function getExtend2() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    // `@include` and `@extend` have the same type of valid selectors.
    x.push(getIncludeSelector());

    var token = tokens[startPos];
    return newNode(NodeType.ExtendType, x, token.ln, token.col);
  }


  /**
   * @param {Number} i Token's index number
   * @returns {Number}
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
   * @returns {Array}
   */
  function getFunction() {
    let startPos = pos;
    let x = getIdentOrInterpolation();
    let body;

    body = x[0].content === 'not' ? getNotArguments() : getArguments();

    x.push(body);

    var token = tokens[startPos];
    return newNode(NodeType.FunctionType, x, token.ln, token.col);
  }

  /**
   * @returns {Array}
   */
  function getArguments() {
    let startPos = pos;
    let x = [];
    let body;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
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
   * @returns {Array}
   */
  function getNotArguments() {
    let startPos = pos;
    let x = [];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
      if (checkSimpleSelector(pos)) x.push(getSimpleSelector());
      else throwError();
    }

    var end = getLastPosition(x, line, column, 1);
    pos++;

    return newNode(NodeType.ArgumentsType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of an identifier
   * @param {Number} i Token's index number
   * @returns {Number} Length of the identifier
   */
  function checkIdent(i) {
    let start = i;
    let interpolations = [];
    let wasIdent;
    let wasInt = false;
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

    if (!wasIdent && !wasInt && tokens[start].type !== TokenType.Asterisk) return 0;

    tokens[start].ident_last = i - 1;
    if (interpolations.length) tokens[start].interpolations = interpolations;

    return i - start;
  }

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
   * @param {Number} i Token's index number
   * @returns {Number} Length of the identifier
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
   * @returns {Array} `['ident', x]` where `x` is identifier's name
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
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkImportant(i) {
    let start = i;
    let l;

    if (i >= tokensLength ||
        tokens[i++].type !== TokenType.ExclamationMark) return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].value === 'important' ? i - start + 1 : 0;
  }

  /**
   * Get node with `!important` word
   * @returns {Array} `['important', sc]` where `sc` is optional whitespace
   */
  function getImportant() {
    let startPos = pos;
    let x = [];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    x = x.concat(getSC());
    var end = getLastPosition(x, line, column, 9);

    pos++;

    return newNode(NodeType.ImportantType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of an included mixin (`@include` or `@extend`
   *      directive).
   * @param {Number} i Token's index number
   * @returns {Number} Length of the included mixin
   */
  function checkInclude(i) {
    var l;

    if (i >= tokensLength) return 0;

    if (l = checkInclude1(i)) tokens[i].include_type = 1;
    else if (l = checkInclude2(i)) tokens[i].include_type = 2;
    else if (l = checkInclude3(i)) tokens[i].include_type = 3;
    else if (l = checkInclude4(i)) tokens[i].include_type = 4;

    return l;
  }

  /**
   * Check if token is part of `!global` word
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkGlobal(i) {
    let start = i;
    let l;

    if (i >= tokensLength ||
        tokens[i++].type !== TokenType.ExclamationMark) return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].value === 'global' ? i - start + 1 : 0;
  }

  /**
   * Get node with `!global` word
   * @returns {Array} `['global', sc]` where `sc` is optional whitespace
   */
  function getGlobal() {
    let startPos = pos;
    let sc;
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    // Skip `!`:
    pos++;

    sc = getSC();
    var end = getLastPosition(sc, line, column, 6);

    // Skip `global`:
    pos++;

    var x = sc.length ? sc : [];

    return newNode(NodeType.GlobalType, x, token.ln, token.col, end);
  }

  /**
   * Get node with included mixin
   * @returns {Array} `['include', x]`
   */
  function getInclude() {
    switch (tokens[pos].include_type) {
      case 1: return getInclude1();
      case 2: return getInclude2();
      case 3: return getInclude3();
      case 4: return getInclude4();
    }
  }

  /**
   * Check if token is part of an included mixin like `@include nani(foo) {...}`
   * @param {Number} i Token's index number
   * @returns {Number} Length of the include
   */
  function checkInclude1(i) {
    let start = i;
    let l;

    if (l = checkAtkeyword(i)) i += l;
    else return 0;

    if (tokens[start + 1].value !== 'include') return 0;

    if (l = checkSC(i)) i += l;
    else return 0;

    if (l = checkIncludeSelector(i)) i += l;
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
   * @returns {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
   *      ['arguments', z], sc, ['block', q], sc` where `x` is `include` or
   *      `extend`, `y` is mixin's identifier (selector), `z` are arguments
   *      passed to the mixin, `q` is block passed to the mixin and `sc`
   *      are optional whitespaces
   */
  function getInclude1() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    x.push(getIncludeSelector());

    x = x.concat(getSC());

    x.push(getArguments());

    x = x.concat(getSC());

    x.push(getBlock());

    var token = tokens[startPos];
    return newNode(NodeType.IncludeType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of an included mixin like `@include nani(foo)`
   * @param {Number} i Token's index number
   * @returns {Number} Length of the include
   */
  function checkInclude2(i) {
    let start = i;
    let l;

    if (l = checkAtkeyword(i)) i += l;
    else return 0;

    if (tokens[start + 1].value !== 'include') return 0;

    if (l = checkSC(i)) i += l;
    else return 0;

    if (l = checkIncludeSelector(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkArguments(i)) i += l;
    else return 0;

    return i - start;
  }

  /**
   * Get node with included mixin like `@include nani(foo)`
   * @returns {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
   *      ['arguments', z], sc]` where `x` is `include` or `extend`, `y` is
   *      mixin's identifier (selector), `z` are arguments passed to the
   *      mixin and `sc` are optional whitespaces
   */
  function getInclude2() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    x.push(getIncludeSelector());

    x = x.concat(getSC());

    x.push(getArguments());

    var token = tokens[startPos];
    return newNode(NodeType.IncludeType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of an included mixin with a content block passed
   *      as an argument (e.g. `@include nani {...}`)
   * @param {Number} i Token's index number
   * @returns {Number} Length of the mixin
   */
  function checkInclude3(i) {
    let start = i;
    let l;

    if (l = checkAtkeyword(i)) i += l;
    else return 0;

    if (tokens[start + 1].value !== 'include') return 0;

    if (l = checkSC(i)) i += l;
    else return 0;

    if (l = checkIncludeSelector(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkBlock(i)) i += l;
    else return 0;

    return i - start;
  }

  /**
   * Get node with an included mixin with a content block passed
   *      as an argument (e.g. `@include nani {...}`)
   * @returns {Array} `['include', x]`
   */
  function getInclude3() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    x.push(getIncludeSelector());

    x = x.concat(getSC());

    x.push(getBlock());

    var token = tokens[startPos];
    return newNode(NodeType.IncludeType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkInclude4(i) {
    let start = i;
    let l;

    if (l = checkAtkeyword(i)) i += l;
    else return 0;

    if (tokens[start + 1].value !== 'include') return 0;

    if (l = checkSC(i)) i += l;
    else return 0;

    if (l = checkIncludeSelector(i)) i += l;
    else return 0;

    return i - start;
  }

  /**
   * @returns {Array} `['include', x]`
   */
  function getInclude4() {
    let startPos = pos;
    let x = [];

    x.push(getAtkeyword());

    x = x.concat(getSC());

    x.push(getIncludeSelector());

    var token = tokens[startPos];
    return newNode(NodeType.IncludeType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkIncludeSelector(i) {
    let start = i;
    let l;

    while (i < tokensLength) {
      if (l = checkIncludeSelector_(i)) i += l;
      else break;
    }

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getIncludeSelector() {
    let startPos = pos;
    let x = [];
    let t;

    while (pos < tokensLength && checkIncludeSelector_(pos)) {
      t = getIncludeSelector_();

      if (typeof t.content === 'string') x.push(t);
      else x = x.concat(t);
    }

    var token = tokens[startPos];
    return newNode(NodeType.SimpleselectorType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkIncludeSelector_(i) {
    return checkNthselector(i) ||
        checkAttrib(i) ||
        checkPseudo(i) ||
        checkShash(i) ||
        checkPlaceholder(i) ||
        checkIdent(i) ||
        checkClass(i) ||
        checkInterpolation(i);
  }

  /**
   * @returns {Array}
   */
  function getIncludeSelector_() {
    if (checkNthselector(pos)) return getNthselector();
    else if (checkAttrib(pos)) return getAttrib();
    else if (checkPseudo(pos)) return getPseudo();
    else if (checkShash(pos)) return getShash();
    else if (checkPlaceholder(pos)) return getPlaceholder();
    else if (checkIdent(pos)) return getIdent();
    else if (checkClass(pos)) return getClass();
    else if (checkInterpolation(pos)) return getInterpolation();
  }


  /**
   * Check if token is part of an interpolated variable (e.g. `#{$nani}`).
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkInterpolation(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (tokens[i].type !== TokenType.NumberSign ||
        !tokens[i + 1] ||
        tokens[i + 1].type !== TokenType.LeftCurlyBracket) return 0;

    i += 2;

    if (l = checkVariable(i)) tokens[i].interpolation_child = 1;
    else if (l = checkFunction(i)) tokens[i].interpolation_child = 2;
    else return 0;

    i += l;

    return tokens[i].type === TokenType.RightCurlyBracket ? i - start + 1 : 0;
  }

  /**
   * Get node with an interpolated variable
   * @returns {Array} `['interpolation', x]`
   */
  function getInterpolation() {
    let startPos = pos;
    let x = [];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    // Skip `#{`:
    pos += 2;

    var childType = tokens[pos].interpolation_child;
    if (childType === 1) x.push(getVariable());
    else if (childType === 2) x.push(getFunction());

    var end = getLastPosition(x, line, column, 1);
    // Skip `}`:
    pos++;

    return newNode(NodeType.InterpolationType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of a loop.
   * @param {Number} i Token's index number
   * @returns {Number} Length of the loop
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
   * @returns {Array} `['loop', x]`
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
   * @param {Number} i Token's index number
   * @returns {Number} Length of the mixin
   */
  function checkMixin(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if ((l = checkAtkeyword(i)) && tokens[i + 1].value === 'mixin') i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkIdentOrInterpolation(i)) i += l;
    else return 0;

    if (l = checkSC(i)) i += l;

    if (l = checkArguments(i)) i += l;

    if (l = checkSC(i)) i += l;

    if (l = checkBlock(i)) i += l;
    else return 0;

    return i - start;
  }

  /**
   * Get node with a mixin
   * @returns {Array} `['mixin', x]`
   */
  function getMixin() {
    let startPos = pos;
    let x = [getAtkeyword()];

    x = x.concat(getSC());

    if (checkIdentOrInterpolation(pos)) x = x.concat(getIdentOrInterpolation());

    x = x.concat(getSC());

    if (checkArguments(pos)) x.push(getArguments());

    x = x.concat(getSC());

    if (checkBlock(pos)) x.push(getBlock());

    var token = tokens[startPos];
    return newNode(NodeType.MixinType, x, token.ln, token.col);
  }

  /**
   * Check if token is a namespace sign (`|`)
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is `|`, `0` if not
   */
  function checkNamespace(i) {
    return i < tokensLength && tokens[i].type === TokenType.VerticalLine ? 1 : 0;
  }

  /**
   * Get node with a namespace sign
   * @returns {Array} `['namespace']`
   */
  function getNamespace() {
    var startPos = pos;

    pos++;

    var token = tokens[startPos];
    return newNode(NodeType.NamespaceType, '|', token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNmName(i) {
    var start = i;

    if (i >= tokensLength) return 0;

    // Start char / word
    if (tokens[i].type === TokenType.HyphenMinus ||
        tokens[i].type === TokenType.LowLine ||
        tokens[i].type === TokenType.Identifier ||
        tokens[i].type === TokenType.DecimalNumber) i++;
    else return 0;

    for (; i < tokensLength; i++) {
      if (tokens[i].type !== TokenType.HyphenMinus &&
          tokens[i].type !== TokenType.LowLine &&
          tokens[i].type !== TokenType.Identifier &&
          tokens[i].type !== TokenType.DecimalNumber) break;
    }

    tokens[start].nm_name_last = i - 1;

    return i - start;
  }

  /**
   * @returns {String}
   */
  function getNmName() {
    var s = joinValues(pos, tokens[pos].nm_name_last);

    pos = tokens[pos].nm_name_last + 1;

    return s;
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNmName2(i) {
    if (tokens[i].type === TokenType.Identifier) return 1;
    else if (tokens[i].type !== TokenType.DecimalNumber) return 0;

    i++;

    return i < tokensLength && tokens[i].type === TokenType.Identifier ? 2 : 1;
  }

  /**
   * @returns {String}
   */
  function getNmName2() {
    var s = tokens[pos].value;

    if (tokens[pos++].type === TokenType.DecimalNumber &&
        pos < tokensLength &&
        tokens[pos].type === TokenType.Identifier) s += tokens[pos++].value;

    return s;
  }

  /**
   * Check if token is part of an nth-selector's identifier (e.g. `2n+1`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNth(i) {
    if (i >= tokensLength) return 0;

    return checkNth1(i) || checkNth2(i);
  }

  /**
   * Check if token is part of an nth-selector's identifier in the form of
   *      sequence of decimals and n-s (e.g. `3`, `n`, `2n+1`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNth1(i) {
    var start = i;

    for (; i < tokensLength; i++) {
      if (tokens[i].type !== TokenType.DecimalNumber &&
          tokens[i].value !== 'n') break;
    }

    if (i !== start) tokens[start].nth_last = i - 1;

    return i - start;
  }

  /**
   * Get node for nth-selector's identifier (e.g. `2n+1`)
   * @returns {Array} `['nth', x]` where `x` is identifier's text
   */
  function getNth() {
    let startPos = pos;
    let x;

    if (tokens[pos].nth_last) {
      x = joinValues(pos, tokens[pos].nth_last);
      pos = tokens[pos].nth_last + 1;
    } else {
      x = tokens[pos++].value;
    }

    var token = tokens[startPos];
    return newNode(NodeType.NthType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of `even` or `odd` nth-selector's identifier
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNth2(i) {
    return tokens[i].value === 'even' || tokens[i].value === 'odd' ? 1 : 0;
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNthf(i) {
    let start = i;
    let l = 0;

    if (tokens[i++].type !== TokenType.Colon) return 0;

    // There was `:`:
    l++;

    if (tokens[i++].value !== 'nth' || tokens[i++].value !== '-') return 0;

    // There was either `nth-` or `last-`:
    l += 2;

    if ('child' === tokens[i].value) {
      l += 1;
    } else if ('last-child' === tokens[i].value +
        tokens[i + 1].value +
        tokens[i + 2].value) {
      l += 3;
    } else if ('of-type' === tokens[i].value +
        tokens[i + 1].value +
        tokens[i + 2].value) {
      l += 3;
    } else if ('last-of-type' === tokens[i].value +
        tokens[i + 1].value +
        tokens[i + 2].value +
        tokens[i + 3].value +
        tokens[i + 4].value) {
      l += 5;
    } else return 0;

    tokens[start + 1].nthf_last = start + l - 1;

    return l;
  }

  /**
   * @returns {String}
   */
  function getNthf() {
    pos++;

    var s = joinValues(pos, tokens[pos].nthf_last);

    pos = tokens[pos].nthf_last + 1;

    return s;
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkNthselector(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (l = checkNthf(i)) i += l;
    else return 0;

    if (tokens[i].type !== TokenType.LeftParenthesis || !tokens[i].right) return 0;

    l++;

    var rp = tokens[i++].right;

    while (i < rp) {
      if (l = checkSC(i) ||
          checkUnary(i) ||
          checkInterpolation(i) ||
          checkNth(i)) i += l;
      else return 0;
    }

    return rp - start + 1;
  }

  /**
   * @returns {Array}
   */
  function getNthselector() {
    var token = tokens[pos];
    var nthf = newNode(NodeType.IdentType, getNthf(), token.ln, token.col);
    var x = [];
    var line = token.ln;
    var column = token.col;

    x.push(nthf);

    pos++;

    while (tokens[pos].type !== TokenType.RightParenthesis) {
      if (checkSC(pos)) x = x.concat(getSC());
      else if (checkUnary(pos)) x.push(getUnary());
      else if (checkInterpolation(pos)) x.push(getInterpolation());
      else if (checkNth(pos)) x.push(getNth());
    }

    var end = getLastPosition(x, line, column, 1);
    pos++;

    return newNode(NodeType.NthselectorType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of a number
   * @param {Number} i Token's index number
   * @returns {Number} Length of number
   */
  function checkNumber(i) {
    if (i >= tokensLength) return 0;

    if (tokens[i].number_l) return tokens[i].number_l;

    // `10`:
    if (i < tokensLength && tokens[i].type === TokenType.DecimalNumber &&
        (!tokens[i + 1] ||
        (tokens[i + 1] && tokens[i + 1].type !== TokenType.FullStop)))
        return (tokens[i].number_l = 1, tokens[i].number_l);

    // `10.`:
    if (i < tokensLength &&
        tokens[i].type === TokenType.DecimalNumber &&
        tokens[i + 1] && tokens[i + 1].type === TokenType.FullStop &&
        (!tokens[i + 2] || (tokens[i + 2].type !== TokenType.DecimalNumber)))
        return (tokens[i].number_l = 2, tokens[i].number_l);

    // `.10`:
    if (i < tokensLength &&
        tokens[i].type === TokenType.FullStop &&
        tokens[i + 1].type === TokenType.DecimalNumber)
        return (tokens[i].number_l = 2, tokens[i].number_l);

    // `10.10`:
    if (i < tokensLength &&
        tokens[i].type === TokenType.DecimalNumber &&
        tokens[i + 1] && tokens[i + 1].type === TokenType.FullStop &&
        tokens[i + 2] && tokens[i + 2].type === TokenType.DecimalNumber)
        return (tokens[i].number_l = 3, tokens[i].number_l);

    return 0;
  }

  /**
   * Get node with number
   * @returns {Array} `['number', x]` where `x` is a number converted
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
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is an operator, otherwise `0`
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
   * @returns {Array} `['operator', x]` where `x` is an operator converted
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
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkOptional(i) {
    let start = i;
    let l;

    if (i >= tokensLength ||
        tokens[i++].type !== TokenType.ExclamationMark) return 0;

    if (l = checkSC(i)) i += l;

    return tokens[i].value === 'optional' ? i - start + 1 : 0;
  }

  /**
   * Get node with `!optional` word
   */
  function getOptional() {
    let startPos = pos;
    let x = [];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    pos++;

    x = x.concat(getSC());
    var end = getLastPosition(x, line, column, 8);

    pos++;

    return newNode(NodeType.OptionalType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of text inside parentheses, e.g. `(1)`
   * @param {Number} i Token's index number
   * @return {Number}
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
   * Check if token is a parent selector (`&`).
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkParentSelector(i) {
    return i < tokensLength && tokens[i].type === TokenType.Ampersand ? 1 : 0;
  }

  /**
   * Get node with a parent selector
   * @returns {Array} `['parentSelector']`
   */
  function getParentSelector() {
    var startPos = pos;

    pos++;

    var token = tokens[startPos];
    return newNode(NodeType.ParentSelectorType, '&', token.ln, token.col);
  }

  /**
   * Check if token is part of a number with percent sign (e.g. `10%`)
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkPercentage(i) {
    var x;

    if (i >= tokensLength) return 0;

    x = checkNumber(i);

    if (!x || i + x >= tokensLength) return 0;

    return tokens[i + x].type === TokenType.PercentSign ? x + 1 : 0;
  }

  /**
   * Get node of number with percent sign
   * @returns {Array} `['percentage', ['number', x]]` where `x` is a number
   *      (without percent sign) converted to string.
   */
  function getPercentage() {
    let startPos = pos;
    let x = [getNumber()];
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    var end = getLastPosition(x, line, column, 1);
    pos++;

    return newNode(NodeType.PercentageType, x, token.ln, token.col, end);
  }

  /**
   * Check if token is part of a placeholder selector (e.g. `%abc`).
   * @param {Number} i Token's index number
   * @returns {Number} Length of the selector
   */
  function checkPlaceholder(i) {
    var l;

    if (i >= tokensLength) return 0;

    if (tokens[i].placeholder_l) return tokens[i].placeholder_l;

    if (tokens[i].type === TokenType.PercentSign && (l = checkIdentOrInterpolation(i + 1))) {
      tokens[i].placeholder_l = l + 1;
      return l + 1;
    } else return 0;
  }

  /**
   * Get node with a placeholder selector
   * @returns {Array} `['placeholder', ['ident', x]]` where x is a placeholder's
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
   * @param {Number} i Token's index number
   * @returns {Number}
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
   * @returns {Array}
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
   * @param {Number} i Token's index number
   * @returns {Number} Length of the property
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
   * @returns {Array} `['property', x]`
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
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is a colon, otherwise `0`
   */
  function checkPropertyDelim(i) {
    return i < tokensLength && tokens[i].type === TokenType.Colon ? 1 : 0;
  }

  /**
   * Get node with a colon
   * @returns {Array} `['propertyDelim']`
   */
  function getPropertyDelim() {
    var startPos = pos;

    pos++;

    var token = tokens[startPos];
    return newNode(NodeType.PropertyDelimType, ':', token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkPseudo(i) {
    return checkPseudoe(i) ||
        checkPseudoc(i);
  }

  /**
   * @returns {Array}
   */
  function getPseudo() {
    if (checkPseudoe(pos)) return getPseudoe();
    if (checkPseudoc(pos)) return getPseudoc();
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkPseudoe(i) {
    var l;

    if (i >= tokensLength || tokens[i++].type !== TokenType.Colon ||
        i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

    return (l = checkIdentOrInterpolation(i)) ? l + 2 : 0;
  }

  /**
   * @returns {Array}
   */
  function getPseudoe() {
    let startPos = pos;

    pos += 2;

    let x = getIdentOrInterpolation();

    var token = tokens[startPos];
    return newNode(NodeType.PseudoeType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkPseudoc(i) {
    var l;

    if (i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

    return (l = checkFunction(i) || checkIdentOrInterpolation(i)) ? l + 1 : 0;
  }

  /**
   * @returns {Array}
   */
  function getPseudoc() {
    let startPos = pos;
    let x = [];

    pos++;

    if (checkFunction(pos)) x.push(getFunction());
    else x = x.concat(getIdentOrInterpolation());

    var token = tokens[startPos];
    return newNode(NodeType.PseudocType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkRuleset(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (tokens[start].ruleset_l) return tokens[start].ruleset_l;

    while (i < tokensLength) {
      if (l = checkBlock(i)) {
        i += l;
        break;
      }
      else if (l = checkSelector(i)) i += l;
      else return 0;
    }

    tokens[start].ruleset_l = i - start;

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getRuleset() {
    let startPos = pos;
    let x = [];

    while (pos < tokensLength) {
      if (checkBlock(pos)) {
        x.push(getBlock());
        break;
      }
      else if (checkSelector(pos)) x.push(getSelector());
      else break;
    }

    var token = tokens[startPos];
    return newNode(NodeType.RulesetType, x, token.ln, token.col);
  }

  /**
   * Check if token is marked as a space (if it's a space or a tab
   *      or a line break).
   * @param {Number} i
   * @returns {Number} Number of spaces in a row starting with the given token.
   */
  function checkS(i) {
    return i < tokensLength && tokens[i].ws ? tokens[i].ws_last - i + 1 : 0;
  }

  /**
   * Get node with spaces
   * @returns {Array} `['s', x]` where `x` is a string containing spaces
   */
  function getS() {
    let startPos = pos;
    let x = joinValues(pos, tokens[pos].ws_last);

    pos = tokens[pos].ws_last + 1;

    var token = tokens[startPos];
    return newNode(NodeType.SType, x, token.ln, token.col);
  }

  /**
   * Check if token is a space or a comment.
   * @param {Number} i Token's index number
   * @returns {Number} Number of similar (space or comment) tokens
   *      in a row starting with the given token.
   */
  function checkSC(i) {
    if (i >= tokensLength) return 0;

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
   * Get node with spaces and comments
   * @returns {Array} Array containing nodes with spaces (if there are any)
   *      and nodes with comments (if there are any):
   *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
   *      and `y` is a comment's text (without `/*` and `* /`).
   */
  function getSC() {
    var sc = [];

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
   * Check if token is part of a selector
   * @param {Number} i Token's index number
   * @returns {Number} Length of the selector
   */
  function checkSelector(i) {
    let start = i;
    let l;

    while (i < tokensLength) {
      if (l = checkSimpleSelector(i) || checkDelim(i)) i += l;
      else break;
    }

    if (i !== start) tokens[start].selector_end = i - 1;

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getSelector() {
    let startPos = pos;
    let x = [];
    let selector_end = tokens[pos].selector_end;

    while (pos <= selector_end) {
      x.push(checkDelim(pos) ? getDelim() : getSimpleSelector());
    }

    var token = tokens[startPos];
    return newNode(NodeType.SelectorType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
   *      a simple selector
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkShash(i) {
    var l;

    if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

    return (l = checkNmName(i + 1)) ? l + 1 : 0;
  }

  /**
   * Get node with a hexadecimal number (e.g. `#fff`) inside a simple
   *      selector
   * @returns {Array} `['shash', x]` where `x` is a hexadecimal number
   *      converted to string (without `#`, e.g. `fff`)
   */
  function getShash() {
    let startPos = pos;
    let x = [];

    pos++;

    var ln = tokens[pos].ln;
    var col = tokens[pos].col;
    var ident = newNode(NodeType.IdentType, getNmName(), ln, col);
    x.push(ident);

    var token = tokens[startPos];
    return newNode(NodeType.ShashType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkSimpleSelector(i) {
    let start = i;
    let l;

    while (i < tokensLength) {
      if (l = checkSimpleSelector1(i)) i += l;
      else break;
    }

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getSimpleSelector() {
    let startPos = pos;
    let x = [];
    let t;

    while (pos < tokensLength) {
      if (!checkSimpleSelector1(pos)) break;
      t = getSimpleSelector1();

      if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
      else x = x.concat(t);
    }

    var token = tokens[startPos];
    return newNode(NodeType.SimpleselectorType, x, token.ln, token.col);
  }

  /**
  * @param {Number} i Token's index number
  * @returns {Number}
  */
  function checkSimpleSelector1(i) {
    var l;

    if (l = checkParentSelector(i)) tokens[i].simpleselector1_child = 1;
    else if (l = checkInterpolation(i)) tokens[i].simpleselector1_child = 2;
    else if (l = checkNthselector(i)) tokens[i].simpleselector1_child = 3;
    else if (l = checkCombinator(i)) tokens[i].simpleselector1_child = 4;
    else if (l = checkAttrib(i)) tokens[i].simpleselector1_child = 5;
    else if (l = checkPseudo(i)) tokens[i].simpleselector1_child = 6;
    else if (l = checkShash(i)) tokens[i].simpleselector1_child = 7;
    else if (l = checkAny(i)) tokens[i].simpleselector1_child = 8;
    else if (l = checkSC(i)) tokens[i].simpleselector1_child = 9;
    else if (l = checkNamespace(i)) tokens[i].simpleselector1_child = 10;
    else if (l = checkDeepSelector(i)) tokens[i].simpleselector1_child = 11;

    return l;
  }

  /**
   * @returns {Array}
   */
  function getSimpleSelector1() {
    var childType = tokens[pos].simpleselector1_child;
    if (childType === 1) return getParentSelector();
    if (childType === 2) return getInterpolation();
    if (childType === 3) return getNthselector();
    if (childType === 4) return getCombinator();
    if (childType === 5) return getAttrib();
    if (childType === 6) return getPseudo();
    if (childType === 7) return getShash();
    if (childType === 8) return getAny();
    if (childType === 9) return getSC();
    if (childType === 10) return getNamespace();
    if (childType === 11) return getDeepSelector();
  }

  /**
   * Check if token is part of a string (text wrapped in quotes)
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is part of a string, `0` if not
   */
  function checkString(i) {
    return i < tokensLength && (tokens[i].type === TokenType.StringSQ || tokens[i].type === TokenType.StringDQ) ? 1 : 0;
  }

  /**
   * Get string's node
   * @returns {Array} `['string', x]` where `x` is a string (including
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
   * @param {Number} i Token's index number
   * @returns {Number}
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
   * @returns {Array} `['stylesheet', x]` where `x` is all stylesheet's
   *      nodes.
   */
  function getStylesheet() {
    let startPos = pos;
    let x = [];

    while (pos < tokensLength) {
      if (checkSC(pos)) x = x.concat(getSC());
      else if (checkRuleset(pos)) x.push(getRuleset());
      else if (checkInclude(pos)) x.push(getInclude());
      else if (checkExtend(pos)) x.push(getExtend());
      else if (checkMixin(pos)) x.push(getMixin());
      else if (checkLoop(pos)) x.push(getLoop());
      else if (checkConditionalStatement(pos)) x.push(getConditionalStatement());
      else if (checkAtrule(pos)) x.push(getAtrule());
      else if (checkDeclaration(pos)) x.push(getDeclaration());
      else if (checkDeclDelim(pos)) x.push(getDeclDelim());
      else throwError();
    }

    var token = tokens[startPos];
    return newNode(NodeType.StylesheetType, x, token.ln, token.col);
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkTset(i) {
    return checkVhash(i) ||
        checkAny(i) ||
        checkSC(i) ||
        checkOperator(i) ||
        checkInterpolation(i);
  }

  /**
   * @returns {Array}
   */
  function getTset() {
    if (checkVhash(pos)) return getVhash();
    else if (checkAny(pos)) return getAny();
    else if (checkSC(pos)) return getSC();
    else if (checkOperator(pos)) return getOperator();
    else if (checkInterpolation(pos)) return getInterpolation();
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkTsets(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    while (l = checkTset(i)) {
      i += l;
    }

    return i - start;
  }

  /**
   * @returns {Array}
   */
  function getTsets() {
    let x = [];
    let t;

    while (t = getTset()) {
      if (typeof t.content === 'string') x.push(t);
      else x = x.concat(t);
    }

    return x;
  }

  /**
   * Check if token is an unary (arithmetical) sign (`+` or `-`)
   * @param {Number} i Token's index number
   * @returns {Number} `1` if token is an unary sign, `0` if not
   */
  function checkUnary(i) {
    return i < tokensLength && (tokens[i].type === TokenType.HyphenMinus || tokens[i].type === TokenType.PlusSign) ? 1 : 0;
  }

  /**
   * Get node with an unary (arithmetical) sign (`+` or `-`)
   * @returns {Array} `['unary', x]` where `x` is an unary sign
   *      converted to string.
   */
  function getUnary() {
    let startPos = pos;
    let x = tokens[pos++].value;

    var token = tokens[startPos];
    return newNode(NodeType.UnaryType, x, token.ln, token.col);
  }

  /**
   * Check if token is part of URI (e.g. `url('/css/styles.css')`)
   * @param {Number} i Token's index number
   * @returns {Number} Length of URI
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
   * @returns {Array} `['uri', x]` where `x` is URI's nodes (without `url`
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

    if (checkUri1(pos)) {
      uri = []
          .concat(getSC())
          .concat([getString()])
          .concat(getSC());
    } else {
      uri = [].concat(getSC());
      l = checkExcluding(uriExcluding, pos);
      token = tokens[pos];
      raw = newNode(NodeType.RawType, joinValues(pos, pos + l), token.ln, token.col);

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
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkUri1(i) {
    let start = i;
    let l;

    if (i >= tokensLength) return 0;

    if (l = checkSC(i)) i += l;

    if (tokens[i].type !== TokenType.StringDQ && tokens[i].type !== TokenType.StringSQ) return 0;

    i++;

    if (l = checkSC(i)) i += l;

    return i - start;
  }

  /**
   * Check if token is part of a value
   * @param {Number} i Token's index number
   * @returns {Number} Length of the value
   */
  function checkValue(i) {
    let start = i;
    let l;
    let s;
    let _i;

    while (i < tokensLength) {
      if (checkDeclDelim(i)) break;

      s = checkSC(i);
      _i = i + s;

      if (l = _checkValue(_i)) i += l + s;
      if (!l || checkBlock(i - l)) break;
    }

    return i - start;
  }

  /**
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function _checkValue(i) {
    return checkInterpolation(i) ||
        checkVariable(i) ||
        checkVhash(i) ||
        checkBlock(i) ||
        checkAtkeyword(i) ||
        checkOperator(i) ||
        checkImportant(i) ||
        checkGlobal(i) ||
        checkDefault(i) ||
        checkProgid(i) ||
        checkAny(i);
  }

  /**
   * @returns {Array}
   */
  function getValue() {
    let startPos = pos;
    let x = [];
    let _pos;
    let s;

    while (pos < tokensLength) {
      s = checkSC(pos);
      _pos = pos + s;

      if (checkDeclDelim(_pos)) break;

      if (!_checkValue(_pos)) break;

      if (s) x = x.concat(getSC());
      x.push(_getValue());

      if (checkBlock(_pos)) break;
    }

    var token = tokens[startPos];
    return newNode(NodeType.ValueType, x, token.ln, token.col);
  }

  /**
   * @returns {Array}
   */
  function _getValue() {
    if (checkInterpolation(pos)) return getInterpolation();
    else if (checkVariable(pos)) return getVariable();
    else if (checkVhash(pos)) return getVhash();
    else if (checkBlock(pos)) return getBlock();
    else if (checkAtkeyword(pos)) return getAtkeyword();
    else if (checkOperator(pos)) return getOperator();
    else if (checkImportant(pos)) return getImportant();
    else if (checkGlobal(pos)) return getGlobal();
    else if (checkDefault(pos)) return getDefault();
    else if (checkProgid(pos)) return getProgid();
    else if (checkAny(pos)) return getAny();
  }

  /**
   * Check if token is part of a variable
   * @param {Number} i Token's index number
   * @returns {Number} Length of the variable
   */
  function checkVariable(i) {
    var l;

    if (i >= tokensLength || tokens[i].type !== TokenType.DollarSign) return 0;

    return (l = checkIdent(i + 1)) ? l + 1 : 0;
  }

  /**
   * Get node with a variable
   * @returns {Array} `['variable', ['ident', x]]` where `x` is
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
   * @param {Number} i Token's index number
   * @returns {Number}
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
   * @returns {Array} `['variableslist', ['variable', ['ident', x]]]` where
   *      `x` is a variable name.
   */
  function getVariablesList() {
    let startPos = pos;
    let x = getVariable();
    var token = tokens[startPos];
    var line = token.ln;
    var column = token.col;

    var end = getLastPosition([x], line, column, 3);
    pos += 3;

    return newNode(NodeType.VariablesListType, [x], token.ln, token.col, end);
  }

  /**
   * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
   *      some value
   * @param {Number} i Token's index number
   * @returns {Number}
   */
  function checkVhash(i) {
    var l;

    if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

    return (l = checkNmName2(i + 1)) ? l + 1 : 0;
  }

  /**
   * Get node with a hexadecimal number (e.g. `#fff`) inside some value
   * @returns {Array} `['vhash', x]` where `x` is a hexadecimal number
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

  return function(_tokens, rule, _needInfo) {
    tokens = _tokens;
    needInfo = _needInfo;
    tokensLength = tokens.length;
    pos = 0;

    return rules[rule]();
  };
})();
