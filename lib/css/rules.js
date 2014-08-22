var TokenType = require('../token-types');
var NodeType = require('./node-types');

module.exports = (function() {
    var tokens, tokensLength, pos;

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
        'braces': function() { return checkBraces(pos) && getBraces(); },
        'class': function() { return checkClass(pos) && getClass(); },
        'combinator': function() { return checkCombinator(pos) && getCombinator(); },
        'commentML': function() { return checkCommentML(pos) && getCommentML(); },
        'declaration': function() { return checkDeclaration(pos) && getDeclaration(); },
        'declDelim': function() { return checkDeclDelim(pos) && getDeclDelim(); },
        'delim': function() { return checkDelim(pos) && getDelim(); },
        'dimension': function() { return checkDimension(pos) && getDimension(); },
        'filter': function() { return checkFilter(pos) && getFilter(); },
        'filterv': function() { return checkFilterv(pos) && getFilterv(); },
        'functionExpression': function() { return checkFunctionExpression(pos) && getFunctionExpression(); },
        'function': function() { return checkFunction(pos) && getFunction(); },
        'ident': function() { return checkIdent(pos) && getIdent(); },
        'important': function() { return checkImportant(pos) && getImportant(); },
        'namespace': function() { return checkNamespace(pos) && getNamespace(); },
        'nth': function() { return checkNth(pos) && getNth(); },
        'nthselector': function() { return checkNthselector(pos) && getNthselector(); },
        'number': function() { return checkNumber(pos) && getNumber(); },
        'operator': function() { return checkOperator(pos) && getOperator(); },
        'percentage': function() { return checkPercentage(pos) && getPercentage(); },
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
        'vhash': function() { return checkVhash(pos) && getVhash(); }
    };

    /**
     * Stop parsing and display error
     * @param {Number=} i Token's index number
     */
    function throwError(i) {
        var ln = tokens[i].ln;

        throw {line: ln, syntax: 'css'};
    }

    /**
     * @param {Object} exclude
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkExcluding(exclude, i) {
        var start = i;

        while(i < tokensLength) {
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

    /**
     * Get node
     * @param {Number} i Token's index number
     * @param {Array} value
     * @returns {Array}
     */
    function getNode(i, type, content) {
        return {
            type: type,
            content: content || null,
            start: {
                line: tokens[i].ln,
                column: tokens[i].col
            }
        };
    }

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////


    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkAny(i) {
        var l;

        if (l = checkBraces(i)) tokens[i].any_child = 1;
        else if (l = checkString(i)) tokens[i].any_child = 2;
        else if (l = checkPercentage(i)) tokens[i].any_child = 3;
        else if (l = checkDimension(i)) tokens[i].any_child = 4;
        else if (l = checkNumber(i)) tokens[i].any_child = 5;
        else if (l = checkUri(i)) tokens[i].any_child = 6;
        else if (l = checkFunctionExpression(i)) tokens[i].any_child = 7;
        else if (l = checkFunction(i)) tokens[i].any_child = 8;
        else if (l = checkIdent(i)) tokens[i].any_child = 9;
        else if (l = checkClass(i)) tokens[i].any_child = 10;
        else if (l = checkUnary(i)) tokens[i].any_child = 11;

        return l;
    }

    /**
     * @returns {Array}
     */
    function getAny() {
        var childType = tokens[pos].any_child;

        if (childType === 1) return getBraces();
        else if (childType === 2) return getString();
        else if (childType === 3) return getPercentage();
        else if (childType === 4) return getDimension();
        else if (childType === 5) return getNumber();
        else if (childType === 6) return getUri();
        else if (childType === 7) return getFunctionExpression();
        else if (childType === 8) return getFunction();
        else if (childType === 9) return getIdent();
        else if (childType === 10) return getClass();
        else if (childType === 11) return getUnary();
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

        return (l = checkIdent(i)) ? l + 1 : 0;
    }

    /**
     * Get node with @-word
     * @returns {Array} `['atkeyword', ['ident', x]]` where `x` is
     *      an identifier without
     *      `@` (e.g. `import`, `include`)
     */
    function getAtkeyword() {
        var startPos = pos++,
            content = [getIdent()];

        return getNode(startPos, NodeType.AtkeywordType, content);
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
        var start = i,
            l;

        if (i++ >= tokensLength) return 0;

        if (l = checkSC(i)) i += l;

        if (l = checkIdent(i)) i += l;
        else return 0;

        if (l = checkSC(i)) i += l;

        if (l = checkAttrselector(i)) i += l;
        else return 0;

        if (l = checkSC(i)) i += l;

        if (l = checkIdent(i) || checkString(i)) i += l;
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
        var startPos = pos++;
        var content = []
            .concat(getSC())
            .concat([getIdent()])
            .concat(getSC())
            .concat([getAttrselector()])
            .concat(getSC())
            .concat([checkString(pos)? getString() : getIdent()])
            .concat(getSC());

        pos++;

        return getNode(startPos, NodeType.AttribType, content);
    }

    /**
     * Check if token is part of an attribute selector of the form `[attr]`
     * Attribute can not be empty, e.g. `[]`.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkAttrib2(i) {
        var start = i,
            l;

        if (i++ >= tokensLength) return 0;

        if (l = checkSC(i)) i += l;

        if (l = checkIdent(i)) i += l;
        else return 0;

        if (l = checkSC(i)) i += l;

        return tokens[i].type === TokenType.RightSquareBracket ? i - start : 0;
    }

    /**
     * Get node with an attribute selector of the form `[attr]`
     * @returns {Array} `['attrib', ['ident', x]]` where `x` is attribute's name
     */
    function getAttrib2() {
        var startPos = pos++;
        var content = []
            .concat(getSC())
            .concat([getIdent()])
            .concat(getSC());

        pos++;

        return getNode(startPos, NodeType.AttribType, content);
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

        switch(tokens[i].type) {
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
        var startPos = pos,
            content = tokens[pos++].value;

        if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign)
            content += tokens[pos++].value;

        return getNode(startPos, NodeType.AttrselectorType, content);
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
        else if (l = checkAtruleb(i)) tokens[i].atrule_type = 2; // block @-rule
        else if (l = checkAtrules(i)) tokens[i].atrule_type = 3; // single-line @-rule
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
            case 2: return getAtruleb(); // block @-rule
            case 3: return getAtrules(); // single-line @-rule
        }
    }

    /**
     * Check if token is part of a block @-rule
     * @param {Number} i Token's index number
     * @returns {Number} Length of the @-rule
     */
    function checkAtruleb(i) {
        var start = i,
            l;

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
        var startPos = pos;
        var content = [getAtkeyword()]
            .concat(getTsets())
            .concat([getBlock()]);

        return getNode(startPos, NodeType.AtrulebType, content);
    }

    /**
     * Check if token is part of an @-rule with ruleset
     * @param {Number} i Token's index number
     * @returns {Number} Length of the @-rule
     */
    function checkAtruler(i) {
        var start = i,
            l;

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
        var startPos = pos,
            content = [getAtkeyword(), getAtrulerq()];

        pos++;

        content.push(getAtrulers());

        pos++;

        return getNode(startPos, NodeType.AtrulerType, content);
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
        var startPos = pos,
            content = getTsets();

        return getNode(startPos, NodeType.AtrulerqType, content);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkAtrulers(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkSC(i)) i += l;

        while (i < tokensLength) {
            if (l = checkSC(i)) tokens[i].atrulers_child = 1;
            else if (l = checkAtrule(i)) tokens[i].atrulers_child = 2;
            else if (l = checkRuleset(i)) tokens[i].atrulers_child = 3;
            else break;
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
        var startPos = pos,
            content = getSC();

        while (!tokens[pos].atrulers_end) {
            var childType = tokens[pos].atrulers_child;
            if (childType === 1) content = content.concat(getSC());
            else if (childType === 2) content.push(getAtrule());
            else if (childType === 3) content.push(getRuleset());
        }

        content = content.concat(getSC());

        return getNode(startPos, NodeType.AtrulersType, content);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkAtrules(i) {
        var start = i,
            l;

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
        var startPos = pos,
            content = [getAtkeyword()].concat(getTsets());

        return getNode(startPos, NodeType.AtrulesType, content);
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
        var startPos = pos,
            end = tokens[pos++].right,
            content = [];

        while (pos < end) {
            if (checkBlockdecl(pos)) content = content.concat(getBlockdecl());
            else throwError(pos);
        }

        pos = end + 1;

        return getNode(startPos, NodeType.BlockType, content);
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
        var start = i,
            l;

        if (l = checkSC(i)) i += l;

        if (l = checkFilter(i)) tokens[i].bd_kind = 1;
        else if (l = checkDeclaration(i)) tokens[i].bd_kind = 2;
        else if (l = checkAtrule(i)) tokens[i].bd_kind = 3;
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
     * sc*:s0 (atrule | ruleset | filter | declaration):x declDelim:y sc*:s1 -> concat(s0, [x], [y], s1)
     * @returns {Array}
     */
    function getBlockdecl1() {
        var sc = getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = getFilter();
                break;
            case 2:
                x = getDeclaration();
                break;
            case 3:
                x = getAtrule();
                break;
        }

        return sc
            .concat([x])
            .concat(getSC())
            .concat([getDeclDelim()])
            .concat(getSC());
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkBlockdecl2(i) {
        var start = i,
            l;

        if (l = checkSC(i)) i += l;

        if (l = checkFilter(i)) tokens[i].bd_kind = 1;
        else if (l = checkDeclaration(i)) tokens[i].bd_kind = 2;
        else if (l = checkAtrule(i)) tokens[i].bd_kind = 3;
        else return 0;

        i += l;

        if (l = checkSC(i)) i += l;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getBlockdecl2() {
        var sc = getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = getFilter();
                break;
            case 2:
                x = getDeclaration();
                break;
            case 3:
                x = getAtrule();
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
        var start = i,
            l;

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
     * Check if token is part of text inside parentheses or square brackets
     *      (e.g. `(1)`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkBraces(i) {
        if (i >= tokensLength ||
            (tokens[i].type !== TokenType.LeftParenthesis &&
            tokens[i].type !== TokenType.LeftSquareBracket)) return 0;

        return tokens[i].right - i + 1;
    }

    /**
     * Get node with text inside parentheses or square brackets (e.g. `(1)`)
     * @returns {Array} `['braces', l, r, x*]` where `l` is a left bracket
     *      (e.g. `'('`), `r` is a right bracket (e.g. `')'`) and `x` is
     *      parsed text inside those brackets (if there is any)
     *      (e.g. `['number', '1']`)
     */
    function getBraces() {
        var startPos = pos,
            left = pos,
            right = tokens[pos++].right;
        var x = [tokens[left].value, tokens[right].value]
            .concat(getTsets());

        pos++;

        return getNode(startPos, NodeType.BracesType, x);
    }

    /**
     * Check if token is part of a class selector (e.g. `.abc`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the class selector
     */
    function checkClass(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (tokens[i].class_l) return tokens[i].class_l;

        if (tokens[i++].type === TokenType.FullStop && (l = checkIdent(i))) {
            tokens[i].class_l = l + 1;
            return l + 1;
        }

        return 0;
    }

    /**
     * Get node with a class selector
     * @returns {Array} `['class', ['ident', x]]` where x is a class's
     *      identifier (without `.`, e.g. `abc`).
     */
    function getClass() {
        var startPos = pos++,
            content = [getIdent()];

        return getNode(startPos, NodeType.ClassType, content);
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
        var startPos = pos,
            content = [tokens[pos++].value];

        return getNode(startPos, NodeType.CombinatorType, content);
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
        var startPos = pos,
            s = tokens[pos].value.substring(2),
            l = s.length,
            x;

        if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/')
            s = s.substring(0, l - 2);

        pos++;

        return getNode(startPos, NodeType.CommentMLType, s);
    }

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    function checkDeclaration(i) {
        var start = i,
            l;

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
        var startPos = pos;
        var content = [getProperty()]
            .concat(getSC())
            .concat([getPropertyDelim()])
            .concat(getSC())
            .concat([getValue()]);

        return getNode(startPos, NodeType.DeclarationType, content);
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

        return getNode(startPos, NodeType.DeclDelimType, '');
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
        var startPos = pos++;

        return getNode(startPos, NodeType.DelimType, '');
    }

    /**
     * Check if token is part of a number with dimension unit (e.g. `10px`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkDimension(i) {
        var ln = checkNumber(i),
            li;

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
        var startPos = pos,
            content = [getNumber()],
            ident = getNode(pos, NodeType.IdentType, getNmName2());

        content.push(ident);

        return getNode(startPos, NodeType.DimensionType, content);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkFilter(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkFilterp(i)) i += l;
        else return 0;

        if (tokens[i].type === TokenType.Colon) i++;
        else return 0;

        if (l = checkFilterv(i)) i += l;
        else return 0;

        return i - start;
    }

    /**
     * @returns {Array} `['filter', x, y]`
     */
    function getFilter() {
        var startPos = pos,
            x = [getFilterp()];

        pos++;

        x.push(getFilterv());

        return getNode(startPos, NodeType.FilterType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkFilterp(i) {
        var start = i,
            l,
            x;

        if (i >= tokensLength) return 0;

        if (tokens[i].value === 'filter') l = 1;
        else {
            x = joinValues2(i, 2);

            if (x === '-filter' || x === '_filter' || x === '*filter') l = 2;
            else {
                x = joinValues2(i, 4);

                if (x === '-ms-filter') l = 4;
                else return 0;
            }
        }

        tokens[start].filterp_l = l;

        i += l;

        if (checkSC(i)) i += l;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getFilterp() {
        var startPos = pos,
            ident = getNode(pos, NodeType.IdentType, joinValues2(pos, tokens[pos].filterp_l)),
            x;

        pos += tokens[pos].filterp_l;

        x = [ident].concat(getSC());

        return getNode(startPos, NodeType.PropertyType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkFilterv(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkSC(i)) i += l;

        if (l = checkProgid(i)) i += l;
        else return 0;

        while (l = checkProgid(i)) {
            i += l;
        }

        tokens[start].last_progid = i;

        if (i < tokensLength && (l = checkSC(i))) i += l;

        if (i < tokensLength && (l = checkImportant(i))) i += l;

        return i - start;
    }

    /**
     * progid+:x -> [#filterv].concat(x)
     * @returns {Array}
     */
    function getFilterv() {
        var startPos = pos,
            x = [],
            last_progid = tokens[pos].last_progid;

        x = x.concat(getSC());

        while (pos < last_progid) {
            x.push(getProgid());
        }

        if (checkSC(pos)) x = x.concat(getSC());

        if (pos < tokensLength && checkImportant(pos)) x.push(getImportant());

        return getNode(startPos, NodeType.FiltervType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkFunctionExpression(i) {
        var start = i;

        if (i >= tokensLength || tokens[i++].value !== 'expression' ||
            i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis) return 0;

        return tokens[i].right - start + 1;
    }

    /**
     * @returns {Array}
     */
    function getFunctionExpression() {
        var startPos = pos,
            e;

        pos++;

        e = joinValues(pos + 1, tokens[pos].right - 1);

        pos = tokens[pos].right + 1;

        return getNode(startPos, NodeType.FunctionExpressionType, [e]);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkFunction(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkIdent(i)) i +=l;
        else return 0;

        return i < tokensLength && tokens[i].type === TokenType.LeftParenthesis ?
            tokens[i].right - start + 1 : 0;
    }

    /**
     * @returns {Array}
     */
    function getFunction() {
        var startPos = pos,
            ident = getIdent(),
            x = [ident],
            body;

        body = ident.content === 'not' ? getNotArguments() : getArguments();

        x.push(body);

        return getNode(startPos, NodeType.FunctionType, x);
    }

    /**
     * @returns {Array}
     */
    function getArguments() {
        var startPos = pos,
            x = [],
            body;

        pos++;

        while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkDeclaration(pos)) x.push(getDeclaration());
            else if (checkArgument(pos)) {
                body = getArgument();
                if (typeof body.content === 'string') x.push(body);
                else x = x.concat(body);
            } else if (checkClass(pos)) x.push(getClass());
            else throwError(pos);
        }

        pos++;

        return getNode(startPos, NodeType.ArgumentsType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkArgument(i) {
        var l;

        if (l = checkVhash(i)) tokens[i].argument_child = 1;
        else if (l = checkAny(i)) tokens[i].argument_child = 2;
        else if (l = checkSC(i)) tokens[i].argument_child = 3;
        else if (l = checkOperator(i)) tokens[i].argument_child = 4;

        return l;
    }

    /**
     * @returns {Array}
     */
    function getArgument() {
        var childType = tokens[pos].argument_child;
        if (childType === 1) return getVhash();
        else if (childType === 2) return getAny();
        else if (childType === 3) return getSC();
        else if (childType === 4) return getOperator();
    }

    /**
     * @returns {Array}
     */
    function getNotArguments() {
        var startPos = pos,
            x = [];

        pos++;

        while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkSimpleSelector(pos)) x.push(getSimpleSelector());
            else throwError(pos);
        }

        pos++;

        return getNode(startPos, NodeType.ArgumentsType, x);
    }

    /**
     * Check if token is part of an identifier
     * @param {Number} i Token's index number
     * @returns {Number} Length of the identifier
     */
    function checkIdent(i) {
        var start = i,
            wasIdent,
            l;

        if (i >= tokensLength) return 0;

        // Check if token is part of an identifier starting with `_`:
        if (tokens[i].type === TokenType.LowLine) return checkIdentLowLine(i);

        // If token is a character, `-`, `$` or `*`, skip it & continue:
        if (tokens[i].type === TokenType.HyphenMinus ||
            tokens[i].type === TokenType.Identifier ||
            tokens[i].type === TokenType.DollarSign ||
            tokens[i].type === TokenType.Asterisk) i++;
        else return 0;

        // Remember if previous token's type was identifier:
        wasIdent = tokens[i - 1].type === TokenType.Identifier;

        for (; i < tokensLength; i++) {
            if (i >= tokensLength) break;

            if (tokens[i].type !== TokenType.HyphenMinus &&
                tokens[i].type !== TokenType.LowLine) {
                if (tokens[i].type !== TokenType.Identifier &&
                    (tokens[i].type !== TokenType.DecimalNumber || !wasIdent)) break;
                else wasIdent = true;
            }
        }

        if (!wasIdent && tokens[start].type !== TokenType.Asterisk) return 0;

        tokens[start].ident_last = i - 1;

        return i - start;
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
        var startPos = pos,
            x = joinValues(pos, tokens[pos].ident_last);

        pos = tokens[pos].ident_last + 1;
        return getNode(startPos, NodeType.IdentType, x);
    }

    /**
     * Check if token is part of `!important` word
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkImportant(i) {
        var start = i,
            l;

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
        var startPos = pos,
            x;

        pos++;

        x = getSC();
        if (!x || !x.length) x = '';

        pos++;

        return getNode(startPos, NodeType.ImportantType, x);
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
        var startPos = pos++;

        return getNode(startPos, NodeType.NamespaceType, '');
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkNmName(i) {
        var start = i;

        if (i >= tokensLength) return 0;

        // start char / word
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
        var startPos = pos,
            x;

        if (tokens[pos].nth_last) {
            x = joinValues(pos, tokens[pos].nth_last);
            pos = tokens[pos].nth_last + 1;
        } else {
            x = tokens[pos++].value;
        }

        return getNode(startPos, NodeType.NthType, x);
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
        var start = i,
            l = 0;

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
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkNthf(i)) i += l;
        else return 0;

        if (tokens[i].type !== TokenType.LeftParenthesis || !tokens[i].right) return 0;

        l++;

        var rp = tokens[i++].right;

        while (i < rp) {
            if (l = checkSC(i)) tokens[i].nthselector_child = 1;
            else if (l = checkUnary(i)) tokens[i].nthselector_child = 2;
            else if (l = checkNth(i)) tokens[i].nthselector_child = 3;
            else return 0;
            i += l;
        }

        return rp - start + 1;
    }

    /**
     * @returns {Array}
     */
    function getNthselector() {
        var startPos = pos,
            nthf = getNode(pos, NodeType.IdentType, getNthf()),
            x = [];

        x.push(nthf);

        pos++;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            var childType = tokens[pos].nthselector_child;
            if (childType === 1) x = x.concat(getSC());
            else if (childType === 2) x.push(getUnary());
            else if (childType === 3) x.push(getNth());
        }

        pos++;

        return getNode(startPos, NodeType.NthselectorType, x);
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
        var s = '',
            startPos = pos,
            l = tokens[pos].number_l;

        for (var j = 0; j < l; j++) {
            s += tokens[pos + j].value;
        }

        pos += l;

        return getNode(startPos, NodeType.NumberType, s);
    }

    /**
     * Check if token is an operator (`/`, `,`, `:` or `=`).
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is an operator, otherwise `0`
     */
    function checkOperator(i) {
        if (i >= tokensLength) return 0;

        switch(tokens[i].type) {
            case TokenType.Solidus:
            case TokenType.Comma:
            case TokenType.Colon:
            case TokenType.EqualsSign:
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
        var startPos = pos,
            x = tokens[pos++].value;

        return getNode(startPos, NodeType.OperatorType, x);
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
        var startPos = pos,
            x = [getNumber()];

        pos++;

        return getNode(startPos, NodeType.PercentageType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkProgid(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkSC(i)) i += l;

        if (joinValues2(i, 6) === 'progid:DXImageTransform.Microsoft.') i += 6;
        else return 0;

        if (l = checkIdent(i)) i += l;
        else return 0;

        if (l = checkSC(i)) i += l;

        if (tokens[i].type === TokenType.LeftParenthesis) {
            tokens[start].progid_end = tokens[i].right;
            i = tokens[i].right + 1;
        } else return 0;

        if (l = checkSC(i)) i += l;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getProgid() {
        var startPos = pos,
            progid_end = tokens[pos].progid_end,
            x;

        x = []
            .concat(getSC())
            .concat([_getProgid(progid_end)])
            .concat(getSC());

        return getNode(startPos, NodeType.ProgidType, x);
    }

    /**
     * @param {Number} progid_end
     * @returns {Array}
     */
    function _getProgid(progid_end) {
        var startPos = pos,
            x = joinValues(pos, progid_end);

        pos = progid_end + 1;

        return getNode(startPos, NodeType.RawType, x);
    }

    /**
     * Check if token is part of a property
     * @param {Number} i Token's index number
     * @returns {Number} Length of the property
     */
    function checkProperty(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = checkIdent(i)) i += l;
        else return 0;

        return i - start;
    }

    /**
     * Get node with a property
     * @returns {Array} `['property', x]`
     */
    function getProperty() {
        var startPos = pos,
            x = [getIdent()];

        return getNode(startPos, NodeType.PropertyType, x);
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
        var startPos = pos++;

        return getNode(startPos, NodeType.PropertyDelimType, '');
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

        return (l = checkIdent(i)) ? l + 2 : 0;
    }

    /**
     * @returns {Array}
     */
    function getPseudoe() {
        var startPos = pos;

        pos += 2;

        var x = [getIdent()];

        return getNode(startPos, NodeType.PseudoeType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkPseudoc(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        if (l = checkFunction(i)) tokens[i].pseudoc_child = 1;
        else if (l = checkIdent(i)) tokens[i].pseudoc_child = 2;
        else return 0;

        return l + 1;
    }

    /**
     * @returns {Array}
     */
    function getPseudoc() {
        var startPos = pos++,
            x;

        var childType = tokens[pos].pseudoc_child;
        if (childType === 1) x = [getFunction()];
        else x = [getIdent()];

        return getNode(startPos, NodeType.PseudocType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkRuleset(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (tokens[start].ruleset_l) return tokens[start].ruleset_l;

        while (i < tokensLength) {
            if (l = checkBlock(i)) {
                tokens[i].ruleset_child = 1;
                i += l;
                break;
            } else if (l = checkSelector(i)) {
                tokens[i].ruleset_child = 2;
                i += l;
            } else return 0;
        }

        tokens[start].ruleset_l = i - start;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getRuleset() {
        var startPos = pos,
            x = [];

        while (pos < tokensLength) {
            var childType = tokens[pos].ruleset_child;
            if (childType === 1) { x.push(getBlock()); break; }
            else if (childType === 2) x.push(getSelector());
            else break;
        }

        return getNode(startPos, NodeType.RulesetType, x);
    }

    /**
     * Check if token is marked as a space (if it's a space or a tab
     *      or a line break).
     * @param i
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
        var startPos = pos,
            x = joinValues(pos, tokens[pos].ws_last);

        pos = tokens[pos].ws_last + 1;

        return getNode(startPos, NodeType.SType, x);
    }

    /**
     * Check if token is a space or a comment.
     * @param {Number} i Token's index number
     * @returns {Number} Number of similar (space or comment) tokens
     *      in a row starting with the given token.
     */
    function checkSC(i) {
        var l,
            lsc = 0;

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
     * @returns {Array} Array containing nodes with spaces (if there are any)
     *      and nodes with comments (if there are any):
     *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
     *      and `y` is a comment's text (without `/*` and `* /`).
     */
    function getSC() {
        var sc = [];

        if (pos >= tokensLength) return sc;

        while (pos < tokensLength) {
            var childType = tokens[pos].sc_child;
            if (childType === 1) sc.push(getS());
            else if (childType === 2) sc.push(getCommentML());
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
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = checkDelim(i)) tokens[i].selector_child = 1;
            else if (l = checkSimpleSelector(i)) tokens[i].selector_child = 2;
            else break;
            i += l;
        }

        if (i !== start) tokens[start].selector_end = i - 1;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getSelector() {
        var startPos = pos,
            x = [],
            selector_end = tokens[pos].selector_end;

        while (pos <= selector_end) {
            var childType = tokens[pos].selector_child;
            if (childType === 1) x.push(getDelim());
            else if (childType === 2) x.push(getSimpleSelector());
        }

        return getNode(startPos, NodeType.SelectorType, x);
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
        var startPos = pos++,
            x = [getNmName()];

        return getNode(startPos, NodeType.ShashType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkSimpleSelector(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = checkSimpleSelector1(i)) i += l;
            else break;
        }

        tokens[start].simpleselector_end = i;
        return i - start;
    }

    /**
     * @returns {Array}
     */
    function getSimpleSelector() {
        var startPos = pos,
            end = tokens[pos].simpleselector_end,
            x = [],
            t;

        while (pos < end) {
            t = getSimpleSelector1();

            if (typeof t.content === 'string') x.push(t);
            else x = x.concat(t);
        }

        return getNode(startPos, NodeType.SimpleselectorType, x);
    }

    /**
    * @param {Number} i Token's index number
    * @returns {Number}
    */
    function checkSimpleSelector1(i) {
        var l;

        if (l = checkNthselector(i)) tokens[i].simpleselector1_child = 1;
        else if (l = checkCombinator(i)) tokens[i].simpleselector1_child = 2;
        else if (l = checkAttrib(i)) tokens[i].simpleselector1_child = 3;
        else if (l = checkPseudo(i)) tokens[i].simpleselector1_child = 4;
        else if (l = checkShash(i)) tokens[i].simpleselector1_child = 5;
        else if (l = checkAny(i)) tokens[i].simpleselector1_child = 6;
        else if (l = checkSC(i)) tokens[i].simpleselector1_child = 7;
        else if (l = checkNamespace(i)) tokens[i].simpleselector1_child = 8;

        return l;
    }

    /**
     * @returns {Array}
     */
    function getSimpleSelector1() {
        var childType = tokens[pos].simpleselector1_child;
        if (childType === 1) return getNthselector();
        else if (childType === 2) return getCombinator();
        else if (childType === 3) return getAttrib();
        else if (childType === 4) return getPseudo();
        else if (childType === 5) return getShash();
        else if (childType === 6) return getAny();
        else if (childType === 7) return getSC();
        else if (childType === 8) return getNamespace();
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
        var startPos = pos,
            x = tokens[pos++].value;

        return getNode(startPos, NodeType.StringType, x);
    }

    /**
     * Validate stylesheet: it should consist of any number (0 or more) of
     * rulesets (sets of rules with selectors), @-rules, whitespaces or
     * comments.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkStylesheet(i) {
        var start = i,
            l;

        // Check every token:
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
     * @returns {Array} `['stylesheet', x]` where `x` is all stylesheet's
     *      nodes.
     */
    function getStylesheet() {
        var startPos = pos,
            x = [],
            childType;

        while (pos < tokensLength) {
            childType = tokens[pos].stylesheet_child;
            if (childType === 1) x = x.concat(getSC());
            else if (childType === 2) x.push(getRuleset());
            else if (childType === 3) x.push(getAtrule());
            else if (childType === 4) x.push(getDeclDelim());
        }

        return getNode(startPos, NodeType.StylesheetType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkTset(i) {
        var l;

        if (l = checkVhash(i)) tokens[i].tset_child = 1;
        else if (l = checkAny(i)) tokens[i].tset_child = 2;
        else if (l = checkSC(i)) tokens[i].tset_child = 3;
        else if (l = checkOperator(i)) tokens[i].tset_child = 4;

        return l;
    }

    /**
     * @returns {Array}
     */
    function getTset() {
        var childType = tokens[pos].tset_child;
        if (childType === 1) return getVhash();
        else if (childType === 2) return getAny();
        else if (childType === 3) return getSC();
        else if (childType === 4) return getOperator();
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkTsets(i) {
        var start = i,
            l;

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
        var x = [],
            t;

        while (checkTset(pos)) {
            t = getTset();
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
        var startPos = pos,
            x = tokens[pos++].value;

        return getNode(startPos, NodeType.UnaryType, x);
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
        var startPos = pos,
            uriExcluding = {},
            uri,
            l,
            raw;

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

            pos++;
        } else {
            uri = checkSC(pos) ? getSC() : [];
            l = checkExcluding(uriExcluding, pos),
            raw = getNode(pos, NodeType.RawType, joinValues(pos, pos + l));

            uri.push(raw);

            pos += l + 1;

            if (checkSC(pos)) uri = uri.concat(getSC());

            pos++;
        }

        return getNode(startPos, NodeType.UriType, uri);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function checkUri1(i) {
        var start = i,
            l;

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
        var start = i,
            l, s, _i;

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
     * @returns {Array}
     */
    function getValue() {
        var startPos = pos,
            end = tokens[pos].value_end,
            x = [],
            s, _pos;

        while (pos < end) {
            if (tokens[pos].value_child) x.push(_getValue());
            else x = x.concat(getSC());
        }

        return getNode(startPos, NodeType.ValueType, x);
    }

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    function _checkValue(i) {
        var l;

        if (l = checkVhash(i)) tokens[i].value_child = 1;
        else if (l = checkAny(i)) tokens[i].value_child = 2;
        else if (l = checkOperator(i)) tokens[i].value_child = 3;
        else if (l = checkImportant(i)) tokens[i].value_child = 4;

        return l;
    }

    /**
     * @returns {Array}
     */
    function _getValue() {
        var childType = tokens[pos].value_child;
        if (childType === 1) return getVhash();
        else if (childType === 2) return getAny();
        else if (childType === 3) return getOperator();
        else if (childType === 4) return getImportant();
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
        var startPos = pos++,
            x = [getNmName2()];

        return getNode(startPos, NodeType.VhashType, x);
    }

    return function(_tokens, rule) {
        tokens = _tokens;
        tokensLength = tokens.length;
        pos = 0;

        return rules[rule]();
   };
})();
