var getAST = (function() {

    var syntax, // syntax name (e.g. `scss`)
        tokens, // list of tokens
        pos, // position of current token in tokens' list
        failLN = 0, // the largest line number of token that failed validation
        currentBlockLN = 0, // line number of current token
        needInfo = false;

    var CSSPNodeType,
        CSSPRules;

    CSSPNodeType = {
        AtkeywordType: 'atkeyword',
        AtrulebType: 'atruleb',
        AtrulerType: 'atruler',
        AtrulerqType: 'atrulerq',
        AtrulersType: 'atrulers',
        AtrulesType: 'atrules',
        AttribType: 'attrib',
        AttrselectorType: 'attrselector',
        BlockType: 'block',
        BracesType: 'braces',
        CdcType: 'cdc',
        CdoType: 'cdo',
        ClazzType: 'clazz',
        CombinatorType: 'combinator',
        CommentType: 'comment',
        DeclarationType: 'declaration',
        DecldelimType: 'decldelim',
        DefaultType: 'default',
        DelimType: 'delim',
        DimensionType: 'dimension',
        FilterType: 'filter',
        FiltervType: 'filterv',
        FunktionType: 'funktion',
        FunctionBodyType: 'functionBody',
        FunctionExpressionType: 'functionExpression',
        IdentType: 'ident',
        ImportantType: 'important',
        IncludeType :'include',
        InterpolationType: 'interpolation',
        NamespaceType: 'namespace',
        NthType: 'nth',
        NthselectorType: 'nthselector',
        NumberType: 'number',
        OperatorType: 'operator',
        ParentSelectorType: 'parentselector',
        PercentageType: 'percentage',
        PlaceholderType: 'placeholder',
        ProgidType: 'progid',
        PseudocType: 'pseudoc',
        PseudoeType: 'pseudoe',
        PropertyType: 'property',
        RawType: 'raw',
        RulesetType: 'ruleset',
        SType: 's',
        SelectorType: 'selector',
        ShashType: 'shash',
        SimpleselectorType: 'simpleselector',
        StringType: 'string',
        StylesheetType: 'stylesheet',
        UnaryType: 'unary',
        UnknownType: 'unknown',
        UriType: 'uri',
        ValueType: 'value',
        VariableType: 'variable',
        VariablesListType: 'variableslist',
        VhashType: 'vhash'
    };

    CSSPRules = {
        'atkeyword': function() { if (checkAtkeyword(pos)) return getAtkeyword() },
        'atruleb': function() { if (checkAtruleb(pos)) return getAtruleb() },
        'atruler': function() { if (checkAtruler(pos)) return getAtruler() },
        'atrulerq': function() { if (checkAtrulerq(pos)) return getAtrulerq() },
        'atrulers': function() { if (checkAtrulers(pos)) return getAtrulers() },
        'atrules': function() { if (checkAtrules(pos)) return getAtrules() },
        'attrib': function() { if (checkAttrib(pos)) return getAttrib() },
        'attrselector': function() { if (checkAttrselector(pos)) return getAttrselector() },
        'block': function() { if (checkBlock(pos)) return getBlock() },
        'braces': function() { if (checkBraces(pos)) return getBraces() },
        'clazz': function() { if (checkClazz(pos)) return getClazz() },
        'combinator': function() { if (checkCombinator(pos)) return getCombinator() },
        'comment': function() { if (checkComment(pos)) return getComment() },
        'declaration': function() { if (checkDeclaration(pos)) return getDeclaration() },
        'decldelim': function() { if (checkDecldelim(pos)) return getDecldelim() },
        'default': function () { if (checkDefault(pos)) return getDefault() },
        'delim': function() { if (checkDelim(pos)) return getDelim() },
        'dimension': function() { if (checkDimension(pos)) return getDimension() },
        'filter': function() { if (checkFilter(pos)) return getFilter() },
        'filterv': function() { if (checkFilterv(pos)) return getFilterv() },
        'functionExpression': function() { if (checkFunctionExpression(pos)) return getFunctionExpression() },
        'funktion': function() { if (checkFunktion(pos)) return getFunktion() },
        'ident': function() { if (checkIdent(pos)) return getIdent() },
        'important': function() { if (checkImportant(pos)) return getImportant() },
        'include': function () { if (checkInclude(pos)) return getInclude() },
        'interpolation': function () { if (checkInterpolation(pos)) return getInterpolation() },
        'namespace': function() { if (checkNamespace(pos)) return getNamespace() },
        'nth': function() { if (checkNth(pos)) return getNth() },
        'nthselector': function() { if (checkNthselector(pos)) return getNthselector() },
        'number': function() { if (checkNumber(pos)) return getNumber() },
        'operator': function() { if (checkOperator(pos)) return getOperator() },
        'parentselector': function () { if (checkParentSelector(pos)) return getParentSelector() },
        'percentage': function() { if (checkPercentage(pos)) return getPercentage() },
        'placeholder': function() { if (checkPlaceholder(pos)) return getPlaceholder() },
        'progid': function() { if (checkProgid(pos)) return getProgid() },
        'property': function() { if (checkProperty(pos)) return getProperty() },
        'pseudoc': function() { if (checkPseudoc(pos)) return getPseudoc() },
        'pseudoe': function() { if (checkPseudoe(pos)) return getPseudoe() },
        'ruleset': function() { if (checkRuleset(pos)) return getRuleset() },
        's': function() { if (checkS(pos)) return getS() },
        'selector': function() { if (checkSelector(pos)) return getSelector() },
        'shash': function() { if (checkShash(pos)) return getShash() },
        'simpleselector': function() { if (checkSimpleselector(pos)) return getSimpleSelector() },
        'string': function() { if (checkString(pos)) return getString() },
        'stylesheet': function() { if (checkStylesheet(pos)) return getStylesheet() },
        'unary': function() { if (checkUnary(pos)) return getUnary() },
        'unknown': function() { if (checkUnknown(pos)) return getUnknown() },
        'uri': function() { if (checkUri(pos)) return getUri() },
        'value': function() { if (checkValue(pos)) return getValue() },
        'variable': function () { if (checkVariable(pos)) return getVariable() },
        'variableslist': function () { if (checkVariablesList(pos)) return getVariablesList() },
        'vhash': function() { if (checkVhash(pos)) return getVhash() }
    };

    /**
     * Save token's line number as the last line with a failed token or
     *      do nothing
     * @param {object} token
     */
    function fail(token) {
        if (token && token.ln > failLN) failLN = token.ln;
    }

    /**
     * Stop parsing and display error
     */
    function throwError() {
        throw new Error('Please check the validity of the CSS block starting from the line #' + currentBlockLN);
    }

    /**
     * Convert tokens to AST
     * @param {String} _syntax Syntax name (e.g. `scss`)
     * @param {Array} _tokens List of tokens
     * @param rule
     * @param _needInfo
     * @returns {*}
     * @private
     */
    function _getAST(_syntax, _tokens, rule, _needInfo) {
        syntax = _syntax;
        tokens = _tokens;
        rule = rule || 'stylesheet';
        needInfo = _needInfo;
        pos = 0;

        // Mark whitespaces and comments:
        markSC();

        // Validate and convert:
        return CSSPRules[rule]();
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAny(_i) {
        return checkBraces(_i) ||
            checkString(_i) ||
            checkVariablesList(_i) ||
            checkVariable(_i) ||
            checkPlaceholder(_i) ||
            checkPercentage(_i) ||
            checkDimension(_i) ||
            checkNumber(_i) ||
            checkUri(_i) ||
            checkFunctionExpression(_i) ||
            checkFunktion(_i) ||
            checkIdent(_i) ||
            checkClazz(_i) ||
            checkUnary(_i);
    }

    /**
     * @returns {Array}
     */
    function getAny() {
        if (checkBraces(pos)) return getBraces();
        else if (checkString(pos)) return getString();
        else if (checkVariablesList(pos)) return getVariablesList();
        else if (checkVariable(pos)) return getVariable();
        else if (checkPlaceholder(pos)) return getPlaceholder();
        else if (checkPercentage(pos)) return getPercentage();
        else if (checkDimension(pos)) return getDimension();
        else if (checkNumber(pos)) return getNumber();
        else if (checkUri(pos)) return getUri();
        else if (checkFunctionExpression(pos)) return getFunctionExpression();
        else if (checkFunktion(pos)) return getFunktion();
        else if (checkIdent(pos)) return getIdent();
        else if (checkClazz(pos)) return getClazz();
        else if (checkUnary(pos)) return getUnary();
    }

    /**
     * Check if token is part of an @-word (e.g. `@import`, `@include`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAtkeyword(_i) {
        var l;

        // Check that token is `@`:
        if (tokens[_i++].type !== TokenType.CommercialAt) return fail(tokens[_i - 1]);

        if (l = checkIdent(_i)) return l + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with @-word
     * @returns {Array} `['atkeyword', ['ident', x]]` where `x` is an identifier without
     *      `@` (e.g. `import`, `include`)
     */
    function getAtkeyword() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.AtkeywordType, getIdent()]:
            [CSSPNodeType.AtkeywordType, getIdent()];
    }

    /**
     * Check if token is part of an attribute selector (e.g. `[attr]`,
     *      `[attr='panda']`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAttrib(_i) {
        if (tokens[_i].type !== TokenType.LeftSquareBracket) return fail(tokens[_i]);

        if (!tokens[_i].right) return fail(tokens[_i]);

        return tokens[_i].right - _i + 1;
    }

    /**
     * Check if token is part of an attribute selector of the form `[attr='value']`
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAttrib1(_i) {
        var start = _i,
            l;

        _i++;

        l = checkSC(_i); // s0

        if (l) _i += l;

        if (l = checkIdent(_i)) _i += l; // x
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s1

        if (l = checkAttrselector(_i)) _i += l; // a
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s2

        if ((l = checkIdent(_i)) || (l = checkString(_i))) _i += l; // y
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l; // s3

        if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

        return fail(tokens[_i]);
    }

    /**
     * Get node with an attribute selector of the form `[attr='value']`
     * @returns {Array} `['attrib', ['ident', x], ['attrselector', y], [z]]`
     *      where `x` is attribute's name, `y` is operator and `z` is attribute's
     *      value
     */
    function getAttrib1() {
        var startPos = pos;

        pos++;

        var a = (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.AttribType] : [CSSPNodeType.AttribType])
            .concat(getSC())
            .concat([getIdent()])
            .concat(getSC())
            .concat([getAttrselector()])
            .concat(getSC())
            .concat([checkString(pos)? getString() : getIdent()])
            .concat(getSC());

        pos++;

        return a;
    }

    /**
     * Check if token is part of an attribute selector of the form `[attr]`
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAttrib2(_i) {
        var start = _i;

        _i++;

        var l = checkSC(_i);

        if (l) _i += l;

        if (l = checkIdent(_i)) _i += l;

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].type === TokenType.RightSquareBracket) return _i - start;

        return fail(tokens[_i]);
    }

    /**
     * Get node with an attribute selector of the form `[attr]`
     * @returns {Array} `['attrib', ['ident', x]]` where `x` is attribute's name
     */
    function getAttrib2() {
        var startPos = pos;

        pos++;

        var a = (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.AttribType] : [CSSPNodeType.AttribType])
            .concat(getSC())
            .concat([getIdent()])
            .concat(getSC());

        pos++;

        return a;
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
     * Check if token is part of an attribute selector operator (`=`, `~=`,
     *      `^=`, `$=`, `*=` or `|=`)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is part of an attribute
     *      selector operator, returns length of operator (`1` or `2`),
     *      else tries to fail the token and returns `undefined`.
     */
    function checkAttrselector(_i) {
        if (tokens[_i].type === TokenType.EqualsSign) return 1;
        if (tokens[_i].type === TokenType.VerticalLine && (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign)) return 1;

        if (!tokens[_i + 1] || tokens[_i + 1].type !== TokenType.EqualsSign) return fail(tokens[_i]);

        switch(tokens[_i].type) {
            case TokenType.Tilde:
            case TokenType.CircumflexAccent:
            case TokenType.DollarSign:
            case TokenType.Asterisk:
            case TokenType.VerticalLine:
                return 2;
        }

        return fail(tokens[_i]);
    }

    /**
     * Get node with an attribute selector operator (`=`, `~=`, `^=`, `$=`,
     *      `*=` or `|=`)
     * @returns {Array} `['attrselector', x]` where `x` is an operator.
     */
    function getAttrselector() {
        var startPos = pos,
            s = tokens[pos++].value;

        if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign) s += tokens[pos++].value;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.AttrselectorType, s] :
            [CSSPNodeType.AttrselectorType, s];
    }

    /**
     * Check if token is a part of an @-rule
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a part of an @-rule,
     *      returns length of @-rule. Else tries to fail the token and
     *      returns `undefined`.
     */
    function checkAtrule(_i) {
        var l;

        // If token already has a record of being part of an @-rule,
        // return the @-rule's length:
        if (tokens[_i].atrule_l !== undefined) return tokens[_i].atrule_l;

        // If token is part of an @-rule, save the rule's type to token:
        if (l = checkAtruler(_i)) tokens[_i].atrule_type = 1; // @-rule with ruleset
        else if (l = checkAtruleb(_i)) tokens[_i].atrule_type = 2; // block @-rule
        else if (l = checkAtrules(_i)) tokens[_i].atrule_type = 3; // single-line @-rule
        else return fail(tokens[_i]);

        // If token is part of an @-rule, save the rule's length to token:
        tokens[_i].atrule_l = l;

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
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a part of a block @-rule,
     *      returns length of the @-rule. Else tries to fail the token and
     *      returns `undefined`.
     */
    function checkAtruleb(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkTsets(_i)) _i += l;

        if (l = checkBlock(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    /**
     * Get node with a block @-rule
     * @returns {Array}
     * atkeyword:ak tset*:ap block:b -> this.concat([#atruleb, ak], ap, [b])
     */
    function getAtruleb() {
        return (needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.AtrulebType, getAtkeyword()] :
            [CSSPNodeType.AtrulebType, getAtkeyword()])
            .concat(getTsets())
            .concat([getBlock()]);
    }

    /**
     * Check if token is part of an @-rule with ruleset
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a part of an @-rule with ruleset,
     *      returns length of the @-rule. Else tries to fail the token and
     *      returns `undefined`.
     */
    function checkAtruler(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkAtrulerq(_i)) _i += l;

        if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) _i++;
        else return fail(tokens[_i]);

        if (l = checkAtrulers(_i)) _i += l;

        if (_i < tokens.length && tokens[_i].type === TokenType.RightCurlyBracket) _i++;
        else return fail(tokens[_i]);

        return _i - start;
    }

    /**
     * atkeyword:ak atrulerq:x '{' atrulers:y '}' -> [#atruler, ak, x, y]
     * Get node with an @-rule with ruleset
     * @returns {Array}
     */
    function getAtruler() {
        var atruler = needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.AtrulerType, getAtkeyword(), getAtrulerq()] :
            [CSSPNodeType.AtrulerType, getAtkeyword(), getAtrulerq()];

        pos++;

        atruler.push(getAtrulers());

        pos++;

        return atruler;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAtrulerq(_i) {
        return checkTsets(_i);
    }

    /**
     * tset*:ap -> [#atrulerq].concat(ap)
     * @returns {Array}
     */
    function getAtrulerq() {
        return (needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.AtrulerqType] : [CSSPNodeType.AtrulerqType]).concat(getTsets());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAtrulers(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        while ((l = checkRuleset(_i)) || (l = checkAtrule(_i)) || (l = checkSC(_i))) {
            _i += l;
        }

        tokens[_i].atrulers_end = 1;

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    /**
     * sc*:s0 ruleset*:r sc*:s1 -> this.concat([#atrulers], s0, r, s1)
     * @returns {Array}
     */
    function getAtrulers() {
        var atrulers = (needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.AtrulersType] :
            [CSSPNodeType.AtrulersType])
            .concat(getSC());

        while (!tokens[pos].atrulers_end) {
            if (checkSC(pos)) {
                atrulers = atrulers.concat(getSC());
            } else if (checkRuleset(pos)) {
                atrulers.push(getRuleset());
            } else {
                atrulers.push(getAtrule());
            }
        }

        return atrulers.concat(getSC());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkAtrules(_i) {
        var start = _i,
            l;

        if (l = checkAtkeyword(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkTsets(_i)) _i += l;

        if (_i >= tokens.length) return _i - start;

        return _i - start;
    }

    /**
     * atkeyword:ak tset*:ap ';' -> this.concat([#atrules, ak], ap)
     * @returns {Array}
     */
    function getAtrules() {
        var x = needInfo ?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.AtrulesType, getAtkeyword()] :
            [CSSPNodeType.AtrulesType, getAtkeyword()];

        return x.concat(getTsets());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkBlock(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.LeftCurlyBracket) return tokens[_i].right - _i + 1;

        return fail(tokens[_i]);
    }

    /**
     * '{' blockdecl*:x '}' -> this.concatContent([#block], x)
     * @returns {Array}
     */
    function getBlock() {
        var block = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.BlockType] : [CSSPNodeType.BlockType],
            end = tokens[pos].right;

        pos++;

        while (pos < end) {
            if (checkBlockdecl(pos)) block = block.concat(getBlockdecl());
            else throwError();
        }

        pos = end + 1;

        return block;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkBlockdecl(_i) {
        var l;

        if (l = _checkBlockdecl0(_i)) tokens[_i].bd_type = 1;
        else if (l = _checkBlockdecl1(_i)) tokens[_i].bd_type = 2;
        else if (l = _checkBlockdecl2(_i)) tokens[_i].bd_type = 3;
        else if (l = _checkBlockdecl3(_i)) tokens[_i].bd_type = 4;
        else return fail(tokens[_i]);

        return l;
    }

    /**
     * blockdecl = sc*:s0 (filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
     *           | sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
     *           | sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
     *           | sc+:s0 -> s0
     * @returns {Array}
     */
    function getBlockdecl() {
        switch (tokens[pos].bd_type) {
            case 1: return _getBlockdecl0();
            case 2: return _getBlockdecl1();
            case 3: return _getBlockdecl2();
            case 4: return _getBlockdecl3();
        }
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkBlockdecl0(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkInclude(_i)) {
            tokens[_i].bd_kind = 1;
        } else if (l = checkAtrule(_i)) {
            tokens[_i].bd_kind = 2;
        } else if (l = checkFilter(_i)) {
            tokens[_i].bd_kind = 3;
        } else if (l = checkDeclaration(_i)) {
            tokens[_i].bd_kind = 4;
        } else if (l = checkRuleset(_i)) {
            tokens[_i].bd_kind = 5;
        } else return fail(tokens[_i]);

        _i += l;
        if (_i < tokens.length && (l = checkDecldelim(_i))) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    /**
     * sc*:s0 (atrule | ruleset | filter | declaration):x decldelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
     * @returns {Array}
     * @private
     */
    function _getBlockdecl0() {
        var sc = getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = getInclude();
                break;
            case 2:
                x = getAtrule();
                break;
            case 3:
                x = getFilter();
                break;
            case 4:
                x = getDeclaration();
                break;
            case 5:
                x = getRuleset();
                break;
        }

        return sc
            .concat([x])
            .concat([getDecldelim()])
            .concat(getSC());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkBlockdecl1(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkInclude(_i)) {
            tokens[_i].bd_kind = 1;
        } else if (l = checkAtrule(_i)) {
            tokens[_i].bd_kind = 2;
        } else if (l = checkFilter(_i)) {
            tokens[_i].bd_kind = 3;
        } else if (l = checkDeclaration(_i)) {
            tokens[_i].bd_kind = 4;
        } else if (l = checkRuleset(_i)) {
            tokens[_i].bd_kind = 5;
        } else return fail(tokens[_i]);

        _i += l;

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    /**
     * sc*:s0 (filter | declaration):x sc*:s1 -> this.concat(s0, [x], s1)
     * @returns {Array}
     * @private
     */
    function _getBlockdecl1() {
        var sc = getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = getInclude();
                break;
            case 2:
                x = getAtrule();
                break;
            case 3:
                x = getFilter();
                break;
            case 4:
                x = getDeclaration();
                break;
            case 5:
                x = getRuleset();
                break;
        }

        return sc
            .concat([x])
            .concat(getSC());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkBlockdecl2(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (l = checkDecldelim(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    /**
     * sc*:s0 decldelim:x sc*:s1 -> this.concat(s0, [x], s1)
     * @returns {Array}
     * @private
     */
    function _getBlockdecl2() {
        return getSC()
            .concat([getDecldelim()])
            .concat(getSC());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkBlockdecl3(_i) {
        return checkSC(_i);
    }

    /**
     * @returns {Array}
     * @private
     */
    function _getBlockdecl3() {
        return getSC();
    }

    /**
     * Check if token is part of text inside parentheses or square brackets
     *      (e.g. `(1)`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkBraces(_i) {
        if (_i >= tokens.length ||
            (tokens[_i].type !== TokenType.LeftParenthesis &&
                tokens[_i].type !== TokenType.LeftSquareBracket)
            ) return fail(tokens[_i]);

        return tokens[_i].right - _i + 1;
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
            right = tokens[pos].right;

        pos++;

        var tsets = getTsets();

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets) :
            [CSSPNodeType.BracesType, tokens[left].value, tokens[right].value].concat(tsets);
    }

    /**
     * Check if token is part of a class selector (e.g. `.abc`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkClazz(_i) {
        var l;

        if (_i >= tokens.length) return fail(tokens[_i]);

        if (tokens[_i].clazz_l) return tokens[_i].clazz_l;

        if (tokens[_i].type === TokenType.FullStop) {
            if (l = checkInterpolation(_i + 1) || checkIdent(_i + 1)) {
                tokens[_i].clazz_l = l + 1;
                return l + 1;
            }
        }

        return fail(tokens[_i]);
    }

    /**
     * Get node with a class selector
     * @returns {Array} `['clazz', ['ident', x]]` where x is a class's
     *      identifier (without `.`, e.g. `abc`).
     */
    function getClazz() {
        var startPos = pos,
            x;

        pos++;

        x = checkInterpolation(pos) ? getInterpolation() : getIdent();

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.ClazzType, x] :
            [CSSPNodeType.ClazzType, x];
    }

    /**
     * Check if token is a combinator (`+`, `>` or `~`)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a combinator, returns `1`,
     *      else tries to fail the token and returns `undefined`.
     */
    function checkCombinator(_i) {
        if (tokens[_i].type === TokenType.PlusSign ||
            tokens[_i].type === TokenType.GreaterThanSign ||
            tokens[_i].type === TokenType.Tilde) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with a combinator (`+`, `>` or `~`)
     * @returns {Array} `['combinator', x]` where `x` is a combinator
     *      converted to string.
     */
    function getCombinator() {
        return needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.CombinatorType, tokens[pos++].value] :
            [CSSPNodeType.CombinatorType, tokens[pos++].value];
    }

    /**
     * Check if token is a multiline comment.
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a multiline comment,
     *      returns `1`, else tries to fail token and returns `undefined`.
     */
    function checkComment(_i) {
        if (tokens[_i].type === TokenType.CommentML) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with a multiline comment
     * @returns {Array} `['comment', x]` where `x`
     *      is the comment's text (without `/*` and `* /`).
     */
    function getComment() {
        var startPos = pos,
            s = tokens[pos].value.substring(2),
            l = s.length;

        if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/') s = s.substring(0, l - 2);

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.CommentType, s] :
            [CSSPNodeType.CommentType, s];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkDeclaration(_i) {
        var start = _i,
            l;

        if (l = checkProperty(_i)) _i += l;
        else return fail(tokens[_i]);

        if (_i < tokens.length && tokens[_i].type === TokenType.Colon) _i++;
        else return fail(tokens[_i]);

        if (l = checkValue(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    /**
     * @returns {Array}
     */
    function getDeclaration() {
        var declaration = needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.DeclarationType, getProperty()] :
            [CSSPNodeType.DeclarationType, getProperty()];

        pos++;

        declaration.push(getValue());

        return declaration;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkDecldelim(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.Semicolon) return 1;

        return fail(tokens[_i]);
    }

    /**
     * @returns {Array}
     */
    function getDecldelim() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.DecldelimType] :
            [CSSPNodeType.DecldelimType];
    }

    /**
     * Check if token if part of `!default` word.
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkDefault(_i) {
        var start = _i,
            l;

        if (syntax !== 'scss') return fail(tokens[_i]);

        if (tokens[_i++].type !== TokenType.ExclamationMark) return fail(tokens[_i - 1]);

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].value !== 'default') return fail(tokens[_i]);

        return _i - start + 1;
    }

    /**
     * @returns {Array}
     */
    function getDefault() {
        var startPos = pos;

        // Skip `!`:
        pos++;

        var sc = getSC();

        // Skip `default`:
        pos++;

        return (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.DefaultType] : [CSSPNodeType.DefaultType]).concat(sc);
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkDelim(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.Comma) return 1;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
    }

    /**
     * @returns {Array}
     */
    function getDelim() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.DelimType] :
            [CSSPNodeType.DelimType];
    }

    /**
     * Check if token is part of a number with dimension unit (e.g. `10px`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkDimension(_i) {
        var ln = checkNumber(_i),
            li;

        if (!ln || (ln && _i + ln >= tokens.length)) return fail(tokens[_i]);

        if (li = checkNmName2(_i + ln)) return ln + li;

        return fail(tokens[_i]);
    }

    /**
     * Get node of a number with dimension unit
     * @returns {Array} `['dimension', ['number', x], ['ident', y]]` where
     *      `x` is a number converted to string (e.g. `'10'`) and `y` is
     *      a dimension unit (e.g. `'px'`).
     */
    function getDimension() {
        var startPos = pos,
            n = getNumber(),
            dimension = needInfo ?
                [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.IdentType, getNmName2()] :
                [CSSPNodeType.IdentType, getNmName2()];

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.DimensionType, n, dimension] :
            [CSSPNodeType.DimensionType, n, dimension];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkFilter(_i) {
        var start = _i,
            l;

        if (l = checkFilterp(_i)) _i += l;
        else return fail(tokens[_i]);

        if (tokens[_i].type === TokenType.Colon) _i++;
        else return fail(tokens[_i]);

        if (l = checkFilterv(_i)) _i += l;
        else return fail(tokens[_i]);

        return _i - start;
    }

    /**
     * filterp:x ':' filterv:y -> [#filter, x, y]
     * @returns {Array}
     */
    function getFilter() {
        var filter = needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.FilterType, getFilterp()] :
            [CSSPNodeType.FilterType, getFilterp()];

        pos++;

        filter.push(getFilterv());

        return filter;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkFilterp(_i) {
        var start = _i,
            l,
            x;

        if (_i < tokens.length) {
            if (tokens[_i].value === 'filter') l = 1;
            else {
                x = joinValues2(_i, 2);

                if (x === '-filter' || x === '_filter' || x === '*filter') l = 2;
                else {
                    x = joinValues2(_i, 4);

                    if (x === '-ms-filter') l = 4;
                    else return fail(tokens[_i]);
                }
            }

            tokens[start].filterp_l = l;

            _i += l;

            if (checkSC(_i)) _i += l;

            return _i - start;
        }

        return fail(tokens[_i]);
    }

    /**
     * (seq('-filter') | seq('_filter') | seq('*filter') | seq('-ms-filter') | seq('filter')):t sc*:s0 -> this.concat([#property, [#ident, t]], s0)
     * @returns {Array}
     */
    function getFilterp() {
        var startPos = pos,
            x = joinValues2(pos, tokens[pos].filterp_l),
            ident = needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.IdentType, x] : [CSSPNodeType.IdentType, x];

        pos += tokens[pos].filterp_l;

        return (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.PropertyType, ident] : [CSSPNodeType.PropertyType, ident])
            .concat(getSC());

    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkFilterv(_i) {
        var start = _i,
            l;

        if (l = checkProgid(_i)) _i += l;
        else return fail(tokens[_i]);

        while (l = checkProgid(_i)) {
            _i += l;
        }

        tokens[start].last_progid = _i;

        if (_i < tokens.length && (l = checkSC(_i))) _i += l;

        if (_i < tokens.length && (l = checkImportant(_i) || checkDefault(_i))) _i += l;

        return _i - start;
    }

    /**
     * progid+:x -> [#filterv].concat(x)
     * @returns {Array}
     */
    function getFilterv() {
        var filterv = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.FiltervType] : [CSSPNodeType.FiltervType],
            last_progid = tokens[pos].last_progid;

        while (pos < last_progid) {
            filterv.push(getProgid());
        }

        filterv = filterv.concat(checkSC(pos) ? getSC() : []);

        if (pos < tokens.length && checkImportant(pos)) filterv.push(getImportant());
        if (pos < tokens.length && checkDefault(pos)) filterv.push(getDefault());

        return filterv;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkFunctionExpression(_i) {
        var start = _i;

        if (!tokens[_i] || tokens[_i++].value !== 'expression') return fail(tokens[_i - 1]);

        if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

        return tokens[_i].right - start + 1;
    }

    /**
     * ``expression('' functionExpressionBody*:x ')' -> [#functionExpression, x.join('')]
     * @returns {Array}
     */
    function getFunctionExpression() {
        var startPos = pos;

        pos++;

        var e = joinValues(pos + 1, tokens[pos].right - 1);

        pos = tokens[pos].right + 1;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.FunctionExpressionType, e] :
            [CSSPNodeType.FunctionExpressionType, e];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkFunktion(_i) {
        var start = _i,
            l = checkIdent(_i);

        if (!l) return fail(tokens[_i]);

        _i += l;

        if (_i >= tokens.length || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i - 1]);

        return tokens[_i].right - start + 1;
    }

    /**
     * ident:x '(' functionBody:y ')' -> [#funktion, x, y]
     * @returns {Array}
     */
    function getFunktion() {
        var startPos = pos,
            ident = getIdent();

        pos++;

        var body = ident[needInfo? 2 : 1] !== 'not'?
            getFunctionBody() :
            getNotFunctionBody(); // ok, here we have CSS3 initial draft: http://dev.w3.org/csswg/selectors3/#negation

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.FunktionType, ident, body] :
            [CSSPNodeType.FunktionType, ident, body];
    }

    /**
     * @returns {Array}
     */
    function getFunctionBody() {
        var startPos = pos,
            body = [],
            x;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkTset(pos)) {
                x = getTset();
                if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') body.push(x);
                else body = body.concat(x);
            } else if (checkClazz(pos)) {
                body.push(getClazz());
            } else {
                throwError();
            }
        }

        pos++;

        return (needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.FunctionBodyType] :
            [CSSPNodeType.FunctionBodyType]
            ).concat(body);
    }

    /**
     * @returns {Array}
     */
    function getNotFunctionBody() {
        var startPos = pos,
            body = [];

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkSimpleselector(pos)) {
                body.push(getSimpleSelector());
            } else {
                throwError();
            }
        }

        pos++;

        return (needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.FunctionBodyType] :
            [CSSPNodeType.FunctionBodyType]
            ).concat(body);
    }

    /**
     * Check if token is part of an identifier
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is part of an identifier,
     *      returns length of identifier. Else tries to fail the token and
     *      returns `undefined`.
     */
    function checkIdent(_i) {
        var l;

        if (_i >= tokens.length) return fail(tokens[_i]);

        var start = _i,
            wasIdent;

        // Check if token is part of an identifier starting with `_`:
        if (tokens[_i].type === TokenType.LowLine) return checkIdentLowLine(_i);

        // If token is a character, `-`, `$` or `*`, skip it & continue:
        if (tokens[_i].type === TokenType.HyphenMinus ||
            tokens[_i].type === TokenType.Identifier ||
            tokens[_i].type === TokenType.DollarSign ||
            tokens[_i].type === TokenType.Asterisk) _i++;
        else return fail(tokens[_i]);

        // Remember if previous token's type was identifier:
        wasIdent = tokens[_i - 1].type === TokenType.Identifier;

        for (; _i < tokens.length; _i++) {
            if (l = checkInterpolation(_i)) _i += l;

            if (!tokens[_i]) break;

            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.LowLine) {
                if (tokens[_i].type !== TokenType.Identifier &&
                    (tokens[_i].type !== TokenType.DecimalNumber || !wasIdent)
                    ) break;
                else wasIdent = true;
            }
        }

        if (!wasIdent && tokens[start].type !== TokenType.Asterisk) return fail(tokens[_i]);

        tokens[start].ident_last = _i - 1;

        return _i - start;
    }

    /**
     * Check if token is part of an identifier starting with `_`
     * @param {number} _i Token's index number
     * @returns {number} Length of the identifier (always >= 1)
     */
    function checkIdentLowLine(_i) {
        var start = _i;

        _i++;

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.DecimalNumber &&
                tokens[_i].type !== TokenType.LowLine &&
                tokens[_i].type !== TokenType.Identifier) break;
        }

        // Save index number of the last token of the identifier:
        tokens[start].ident_last = _i - 1;

        return _i - start;
    }

    /**
     * Get identifier's node
     * @returns {Array} `['ident', x]` where `x` is an identifier's name
     */
    function getIdent() {
        var startPos = pos,
            s = joinValues(pos, tokens[pos].ident_last);

        pos = tokens[pos].ident_last + 1;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.IdentType, s] :
            [CSSPNodeType.IdentType, s];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkImportant(_i) {
        var start = _i,
            l;

        if (tokens[_i++].type !== TokenType.ExclamationMark) return fail(tokens[_i - 1]);

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].value !== 'important') return fail(tokens[_i]);

        return _i - start + 1;
    }

    /**
     * @returns {Array}
     */
    function getImportant() {
        var startPos = pos;

        pos++;

        var sc = getSC();

        pos++;

        return (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.ImportantType] : [CSSPNodeType.ImportantType]).concat(sc);
    }

    /**
     * Check if token is part of an include (`@include` or `@extend` directive).
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkInclude(_i) {
        var start = _i,
            l;

        if (syntax !== 'scss') return fail(tokens[_i]);

        if (!(l = checkAtrule(_i))) return fail(tokens[_i]);

        if (['include', 'extend'].indexOf(tokens[_i + 1].value) < 0) return fail(tokens[_i]);

        _i += l;

        return _i - start;
    }

    function getInclude() {
        return needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.IncludeType, getAtrule()] :
            [CSSPNodeType.IncludeType, getAtrule()];

    }

    /**
     * Check if token is part of an interpolated variable (e.g. `#{$nani}`).
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkInterpolation(_i) {
        var start = _i,
            l;

        if (syntax !== 'scss') return fail(tokens[_i]);

        if (tokens[_i].type !== TokenType.NumberSign ||
            !tokens[_i + 1] ||
            tokens[_i + 1].type !== TokenType.LeftCurlyBracket) return fail(tokens[_i - 1]);

        _i += 2;

        if (l = checkVariable(_i)) _i += l;

        if (tokens[_i].type !== TokenType.RightCurlyBracket) return fail(tokens[_i - 1]);

        return _i - start + 1;
    }

    /**
     * @returns {Array}
     */
    function getInterpolation() {
        var startPos = pos,
            x;

        // Skip `#{`:
        pos += 2;

        x = getVariable();

        // Skip `}`:
        pos++;

        return needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.InterpolationType, x] : [CSSPNodeType.InterpolationType, x];
    }

    /**
     * Check if token is a namespace sign (`|`)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a namespace sign ('|'),
     *      returns 1, else tries to fail the token and returns `undefined`.
     */
    function checkNamespace(_i) {
        if (tokens[_i].type === TokenType.VerticalLine) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with a namespace sign
     * @returns {Array} `['namespace']`
     */
    function getNamespace() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.NamespaceType] :
            [CSSPNodeType.NamespaceType];
    }

    /**
     * Check if token is part of an nth-selector's identifier (e.g. `2n+1`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNth(_i) {
        return checkNth1(_i) || checkNth2(_i);
    }

    /**
     * Check if token id part of an nth-selector's identifier in the form of
     *      sequence of decimals and n-s (e.g. `3`, `n`, `2n+1`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNth1(_i) {
        var start = _i;

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.DecimalNumber && tokens[_i].value !== 'n') break;
        }

        if (_i !== start) {
            tokens[start].nth_last = _i - 1;
            return _i - start;
        }

        return fail(tokens[_i]);
    }

    /**
     * Get node for nth-selector's identifier (e.g. `2n+1`)
     * @returns {Array} `['nth', x]` where `x` is identifier's text
     */
    function getNth() {
        var startPos = pos;

        if (tokens[pos].nth_last) {
            var n = needInfo?
                [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.NthType, joinValues(pos, tokens[pos].nth_last)] :
                [CSSPNodeType.NthType, joinValues(pos, tokens[pos].nth_last)];

            pos = tokens[pos].nth_last + 1;

            return n;
        }

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.NthType, tokens[pos++].value] :
            [CSSPNodeType.NthType, tokens[pos++].value];
    }

    /**
     * Check if token is part of `even` or `odd` nth-selector's identifier
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNth2(_i) {
        if (tokens[_i].value === 'even' || tokens[_i].value === 'odd') return 1;

        return fail(tokens[_i]);
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNthf(_i) {
        var start = _i,
            l = 0;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]); l++;

        if (tokens[_i++].value !== 'nth' || tokens[_i++].value !== '-') return fail(tokens[_i - 1]); l += 2;

        if ('child' === tokens[_i].value) {
            l += 1;
        } else if ('last-child' === tokens[_i].value +
            tokens[_i + 1].value +
            tokens[_i + 2].value) {
            l += 3;
        } else if ('of-type' === tokens[_i].value +
            tokens[_i + 1].value +
            tokens[_i + 2].value) {
            l += 3;
        } else if ('last-of-type' === tokens[_i].value +
            tokens[_i + 1].value +
            tokens[_i + 2].value +
            tokens[_i + 3].value +
            tokens[_i + 4].value) {
            l += 5;
        } else return fail(tokens[_i]);

        tokens[start + 1].nthf_last = start + l - 1;

        return l;
    }

    /**
     * ':' seq('nth-'):x (seq('child') | seq('last-child') | seq('of-type') | seq('last-of-type')):y -> (x + y)
     * @returns {string}
     */
    function getNthf() {
        pos++;

        var s = joinValues(pos, tokens[pos].nthf_last);

        pos = tokens[pos].nthf_last + 1;

        return s;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNthselector(_i) {
        var start = _i,
            l;

        if (l = checkNthf(_i)) _i += l;
        else return fail(tokens[_i]);

        if (tokens[_i].type !== TokenType.LeftParenthesis || !tokens[_i].right) return fail(tokens[_i]);

        l++;

        var rp = tokens[_i++].right;

        while (_i < rp) {
            if (l = checkSC(_i)) _i += l;
            else if (l = checkUnary(_i)) _i += l;
            else if (l = checkNth(_i)) _i += l;
            else return fail(tokens[_i]);
        }

        return rp - start + 1;
    }

    /**
     * nthf:x '(' (sc | unary | nth)*:y ')' -> [#nthselector, [#ident, x]].concat(y)
     * @returns {Array}
     */
    function getNthselector() {
        var nthf = needInfo?
                [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.IdentType, getNthf()] :
                [CSSPNodeType.IdentType, getNthf()],
            ns = needInfo?
                [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.NthselectorType, nthf] :
                [CSSPNodeType.NthselectorType, nthf];

        pos++;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (checkSC(pos)) ns = ns.concat(getSC());
            else if (checkUnary(pos)) ns.push(getUnary());
            else if (checkNth(pos)) ns.push(getNth());
        }

        pos++;

        return ns;
    }

    /**
     * Check if token is part of a number
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNumber(_i) {
        if (_i < tokens.length && tokens[_i].number_l) return tokens[_i].number_l;

        if (_i < tokens.length && tokens[_i].type === TokenType.DecimalNumber &&
            (!tokens[_i + 1] ||
                (tokens[_i + 1] && tokens[_i + 1].type !== TokenType.FullStop))
            ) return (tokens[_i].number_l = 1, tokens[_i].number_l); // 10

        if (_i < tokens.length &&
            tokens[_i].type === TokenType.DecimalNumber &&
            tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
            (!tokens[_i + 2] || (tokens[_i + 2].type !== TokenType.DecimalNumber))
            ) return (tokens[_i].number_l = 2, tokens[_i].number_l); // 10.

        if (_i < tokens.length &&
            tokens[_i].type === TokenType.FullStop &&
            tokens[_i + 1].type === TokenType.DecimalNumber
            ) return (tokens[_i].number_l = 2, tokens[_i].number_l); // .10

        if (_i < tokens.length &&
            tokens[_i].type === TokenType.DecimalNumber &&
            tokens[_i + 1] && tokens[_i + 1].type === TokenType.FullStop &&
            tokens[_i + 2] && tokens[_i + 2].type === TokenType.DecimalNumber
            ) return (tokens[_i].number_l = 3, tokens[_i].number_l); // 10.10

        return fail(tokens[_i]);
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

        for (var i = 0; i < l; i++) {
            s += tokens[pos + i].value;
        }

        pos += l;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.NumberType, s] :
            [CSSPNodeType.NumberType, s];
    }

    /**
     * Check if token is an operator (`/`, `,`, `:` or `=`)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is an operator, returns `1`,
     *      else tries to fail the token and returns `undefined`.
     */
    function checkOperator(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.Solidus ||
                tokens[_i].type === TokenType.Comma ||
                tokens[_i].type === TokenType.Colon ||
                tokens[_i].type === TokenType.EqualsSign)) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with an operator
     * @returns {Array} `['operator', x]` where `x` is an operator converted
     *      to string.
     */
    function getOperator() {
        return needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.OperatorType, tokens[pos++].value] :
            [CSSPNodeType.OperatorType, tokens[pos++].value];
    }

    /**
     * Check if token is a parent selector (`&`).
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkParentSelector(_i) {
        if (syntax !== 'scss') return fail(tokens[_i]);

        if (tokens[_i].type !== TokenType.Ampersand) return fail(tokens[_i]);

        return 1;
    }

    /**
     * @returns {Array}
     */
    function getParentSelector() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.ParentSelectorType, '&'] :
            [CSSPNodeType.ParentSelectorType, '&'];
    }

    /**
     * Check if token is part of a number with percent sign (e.g. `10%`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkPercentage(_i) {
        var x = checkNumber(_i);

        if (!x || (x && _i + x >= tokens.length)) return fail(tokens[_i]);

        if (tokens[_i + x].type === TokenType.PercentSign) return x + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node of number with percent sign
     * @returns {Array} `['percentage', ['number', x]]` where `x` is a number
     *      (without percent sign) converted to string.
     */
    function getPercentage() {
        var startPos = pos,
            n = getNumber();

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.PercentageType, n] :
            [CSSPNodeType.PercentageType, n];
    }

    /**
     * Check if token is part of a placeholder selector (e.g. `%abc`).
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkPlaceholder(_i) {
        var l;

        if (syntax !== 'scss') fail(tokens[_i]);

        if (_i >= tokens.length) return fail(tokens[_i]);

        if (tokens[_i].placeholder_l) return tokens[_i].placeholder_l;

        if (tokens[_i].type === TokenType.PercentSign) {
            if (l = checkIdent(_i + 1)) {
                tokens[_i].placeholder_l = l + 1;
                return l + 1;
            }
        }

        return fail(tokens[_i]);
    }

    /**
     * Get node with a placeholder selector
     * @returns {Array} `['placeholder', ['ident', x]]` where x is a placeholder's
     *      identifier (without `%`, e.g. `abc`).
     */
    function getPlaceholder() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.PlaceholderType, getIdent()] :
            [CSSPNodeType.PlaceholderType, getIdent()];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkProgid(_i) {
        var start = _i,
            l;

        if (l = checkSC(_i)) _i += l;

        if (joinValues2(_i, 6) === 'progid:DXImageTransform.Microsoft.') {
            _i += 6;
        } else return fail(tokens[_i - 1]);

        if (l = checkIdent(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        if (tokens[_i].type === TokenType.LeftParenthesis) {
            tokens[start].progid_end = tokens[_i].right;
            _i = tokens[_i].right + 1;
        } else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    /**
     * sc*:s0 seq('progid:DXImageTransform.Microsoft.'):x letter+:y '(' (m_string | m_comment | ~')' char)+:z ')' sc*:s1
     *        -> this.concat([#progid], s0, [[#raw, x + y.join('') + '(' + z.join('') + ')']], s1),
     * @returns {Array}
     */
    function getProgid() {
        var progid_end = tokens[pos].progid_end;

        return (needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.ProgidType] : [CSSPNodeType.ProgidType])
            .concat(getSC())
            .concat([_getProgid(progid_end)])
            .concat(getSC());
    }

    /**
     * @param progid_end
     * @returns {Array}
     * @private
     */
    function _getProgid(progid_end) {
        var startPos = pos,
            x = joinValues(pos, progid_end);

        pos = progid_end + 1;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.RawType, x] :
            [CSSPNodeType.RawType, x];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkProperty(_i) {
        var start = _i,
            l;

        if (l = checkVariable(_i)) _i += l;
        else if (l = checkIdent(_i)) _i += l;
        else return fail(tokens[_i]);

        if (l = checkSC(_i)) _i += l;
        return _i - start;
    }

    /**
     * ident:x sc*:s0 -> this.concat([#property, x], s0)
     * @returns {Array}
     */
    function getProperty() {
        return (needInfo?
            [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.PropertyType, checkVariable(pos) ? getVariable() : getIdent()] :
            [CSSPNodeType.PropertyType, checkVariable(pos) ? getVariable() : getIdent()])
            .concat(getSC());
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkPseudo(_i) {
        return checkPseudoe(_i) ||
            checkPseudoc(_i);
    }

    /**
     * @returns {Array}
     */
    function getPseudo() {
        if (checkPseudoe(pos)) return getPseudoe();
        if (checkPseudoc(pos)) return getPseudoc();
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkPseudoe(_i) {
        var l;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if (l = checkInterpolation(_i) || checkIdent(_i)) return l + 2;

        return fail(tokens[_i]);
    }

    /**
     * @returns {Array}
     */
    function getPseudoe() {
        var startPos = pos;

        pos += 2;

        var x = checkInterpolation(pos) ? getInterpolation() : getIdent();

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.PseudoeType, x] :
            [CSSPNodeType.PseudoeType, x];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkPseudoc(_i) {
        var l;

        if (tokens[_i++].type !== TokenType.Colon) return fail(tokens[_i - 1]);

        if (l = checkInterpolation(_i) || checkFunktion(_i) || checkIdent(_i)) return l + 1;

        return fail(tokens[_i]);
    }

    /**
     * ':' (funktion | ident):x -> [#pseudoc, x]
     * @returns {Array}
     */
    function getPseudoc() {
        var startPos = pos;

        pos++;

        var x = checkInterpolation(pos) ? getInterpolation() : (checkFunktion(pos) ? getFunktion() : getIdent());

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.PseudocType, x] :
            [CSSPNodeType.PseudocType, x];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkRuleset(_i) {
        var start = _i,
            l;

        if (tokens[start].ruleset_l !== undefined) return tokens[start].ruleset_l;

        while (l = checkSelector(_i)) {
            _i += l;
        }

        if (l = checkBlock(_i)) _i += l;
        else return fail(tokens[_i]);

        tokens[start].ruleset_l = _i - start;

        return _i - start;
    }

    /**
     * selector*:x block:y -> this.concat([#ruleset], x, [y])
     * @returns {Array}
     */
    function getRuleset() {
        var ruleset = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.RulesetType] : [CSSPNodeType.RulesetType];

        while (!checkBlock(pos)) {
            ruleset.push(getSelector());
        }

        ruleset.push(getBlock());

        return ruleset;
    }

    /**
     * Check if token is marked as a space (if it's a space or a tab
     *      or a line break).
     * @param _i
     * @returns {number|undefined} If token is marked as a space, returns
     *      a number of spaces in a row starting with the given token.
     *      Else tries to mark the token's line number as the last line
     *      with a failed token and returns `undefined`.
     */
    function checkS(_i) {
        if (tokens[_i].ws) return tokens[_i].ws_last - _i + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with spaces
     * @returns {Array} `['s', x]` where `x` is a string containing spaces
     */
    function getS() {
        var startPos = pos,
            s = joinValues(pos, tokens[pos].ws_last);

        pos = tokens[pos].ws_last + 1;

        return needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.SType, s] : [CSSPNodeType.SType, s];
    }

    /**
     * Check if token is a space or a multiline comment.
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is a space or a multiline
     *      comment, returns a number of similar (space or comment) tokens
     *      in a row starting with the given token.
     *      Else tries to mark the token's line number as the last line
     *      with a failed token and returns `undefined`.
     */
    function checkSC(_i) {
        var l,
            lsc = 0;

        while (_i < tokens.length) {
            if (!(l = checkS(_i)) && !(l = checkComment(_i))) break;
            _i += l;
            lsc += l;
        }

        if (lsc) return lsc;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
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

        while (pos < tokens.length) {
            if (checkS(pos)) sc.push(getS());
            else if (checkComment(pos)) sc.push(getComment());
            else break;
        }

        return sc;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkSelector(_i) {
        var start = _i,
            l;

        if (_i < tokens.length) {
            while (l = checkSimpleselector(_i) || checkDelim(_i)) {
                _i += l;
            }

            tokens[start].selector_end = _i - 1;

            return _i - start;
        }
    }

    /**
     * (simpleselector | delim)+:x -> this.concat([#selector], x)
     * @returns {Array}
     */
    function getSelector() {
        var selector = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.SelectorType] : [CSSPNodeType.SelectorType],
            selector_end = tokens[pos].selector_end;

        while (pos <= selector_end) {
            selector.push(checkDelim(pos) ? getDelim() : getSimpleSelector());
        }

        return selector;
    }

    /**
     * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
     *      a simple selector
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkShash(_i) {
        if (tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

        var l = checkNmName(_i + 1);

        if (l) return l + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with a hexadecimal number (e.g. `#fff`) inside a simple
     *      selector
     * @returns {Array} `['shash', x]` where `x` is a hexadecimal number
     *      converted to string (without `#`, e.g. `fff`)
     */
    function getShash() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.ShashType, getNmName()] :
            [CSSPNodeType.ShashType, getNmName()];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkSimpleselector(_i) {
        var start = _i,
            l;

        while (_i < tokens.length) {
            if (l = _checkSimpleSelector(_i)) _i += l;
            else break;
        }

        if (_i - start) return _i - start;

        if (_i >= tokens.length) return fail(tokens[tokens.length - 1]);

        return fail(tokens[_i]);
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkSimpleSelector(_i) {
        return checkParentSelector(_i) ||
            checkNthselector(_i) ||
            checkCombinator(_i) ||
            checkAttrib(_i) ||
            checkPseudo(_i) ||
            checkShash(_i) ||
            checkAny(_i) ||
            checkSC(_i) ||
            checkNamespace(_i);
    }

    /**
     * this.concatContent([#simpleselector], [x])
     * @returns {Array}
     */
    function getSimpleSelector() {
        var ss = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.SimpleselectorType] : [CSSPNodeType.SimpleselectorType],
            t;

        while (pos < tokens.length && _checkSimpleSelector(pos)) {
            t = _getSimpleSelector();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
            else ss = ss.concat(t);
        }

        return ss;
    }

    /**
     * @returns {Array}
     * @private
     */
    function _getSimpleSelector() {
        if (checkParentSelector(pos)) return getParentSelector();
        else if (checkNthselector(pos)) return getNthselector();
        else if (checkCombinator(pos)) return getCombinator();
        else if (checkAttrib(pos)) return getAttrib();
        else if (checkPseudo(pos)) return getPseudo();
        else if (checkShash(pos)) return getShash();
        else if (checkAny(pos)) return getAny();
        else if (checkSC(pos)) return getSC();
        else if (checkNamespace(pos)) return getNamespace();
    }

    /**
     * Check if token is part of a string (text wrapped in quotes)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is part of a string,
     *      returns `1`, else tries to fail token and returns `undefined`.
     */
    function checkString(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.StringSQ || tokens[_i].type === TokenType.StringDQ)
            ) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get string's node
     * @returns {Array} `['string', x]` where `x` is a string (including
     *      quotes).
     */
    function getString() {
        var startPos = pos;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.StringType, tokens[pos++].value] :
            [CSSPNodeType.StringType, tokens[pos++].value];
    }

    /**
     * Validate stylesheet: it should consist of any number (0 or more) of
     * rulesets (sets of rules with selectors), @-rules, whitespaces or
     * comments.
     * @param {number} _i Token's index number
     * @returns {number} Number of checked tokens
     */
    function checkStylesheet(_i) {
        var start = _i,
            l;

        // Check every token:
        while (_i < tokens.length) {
            // If token is a part of a group of spaces and multiline
            // comments, it's ok, continue:
            if (l = checkSC(_i)) _i += l;
            else {
                // TODO: Move into throwError and remove the var:
                currentBlockLN = tokens[_i].ln;
                // If token is part of declaration (property-value pair),
                // it's ok, continue:
                if (l = checkDeclaration(_i)) _i += l;
                else if (l = checkDecldelim(_i)) _i += l;
                // If token is part of an include, it's ok, continue:
                else if (l = checkInclude(_i)) _i += l;
                // If token is a part of an @-rule, it's ok, continue:
                else if (l = checkAtrule(_i)) _i += l;
                // If token is a part of a ruleset, it's ok, continue:
                else if (l = checkRuleset(_i)) _i += l;
                // If token is something, it's ok, continue:
                else if (l = checkUnknown(_i)) _i += l;
                // If token is anything else, throw error and stop:
                else throwError();
            }
        }

        return _i - start;
    }

    /**
     * @returns {Array} `['stylesheet', x]` where `x` is all stylesheet's
     *      nodes.
     */
    function getStylesheet() {
        var stylesheet = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.StylesheetType] : [CSSPNodeType.StylesheetType];

        while (pos < tokens.length) {
            if (checkSC(pos)) stylesheet = stylesheet.concat(getSC());
            else {
                // TODO: Move into throwError and remove the var:
                currentBlockLN = tokens[pos].ln;
                if (checkRuleset(pos)) stylesheet.push(getRuleset());
                else if (checkInclude(pos)) stylesheet.push(getInclude());
                else if (checkAtrule(pos)) stylesheet.push(getAtrule());
                else if (checkDeclaration(pos)) stylesheet.push(getDeclaration());
                else if (checkDecldelim(pos)) stylesheet.push(getDecldelim());
                else if (checkUnknown(pos)) stylesheet.push(getUnknown());
                else throwError();
            }
        }

        return stylesheet;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkTset(_i) {
        return checkVhash(_i) ||
            checkAny(_i) ||
            checkSC(_i) ||
            checkOperator(_i);
    }

    /**
     * @returns {Array}
     */
    function getTset() {
        if (checkVhash(pos)) return getVhash();
        else if (checkAny(pos)) return getAny();
        else if (checkSC(pos)) return getSC();
        else if (checkOperator(pos)) return getOperator();
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkTsets(_i) {
        var start = _i,
            l;

        while (l = checkTset(_i)) {
            _i += l;
        }

        return _i - start;
    }

    /**
     * @returns {Array}
     */
    function getTsets() {
        var tsets = [],
            x;

        while (x = getTset()) {
            if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') tsets.push(x);
            else tsets = tsets.concat(x);
        }

        return tsets;
    }

    /**
     * Check if token is an unary (arithmetical) sign (`+` or `-`)
     * @param {number} _i Token's index number
     * @returns {number | undefined} If token is an unary sign, returns `1`,
     *      else tries to fail the token and returns `undefined`.
     */
    function checkUnary(_i) {
        if (_i < tokens.length &&
            (tokens[_i].type === TokenType.HyphenMinus ||
                tokens[_i].type === TokenType.PlusSign)
            ) return 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with an unary (arithmetical) sign (`+` or `-`)
     * @returns {Array} `['unary', x]` where `x` is an unary sign
     *      converted to string.
     */
    function getUnary() {
        var startPos = pos;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.UnaryType, tokens[pos++].value] :
            [CSSPNodeType.UnaryType, tokens[pos++].value];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkUnknown(_i) {
        if (_i < tokens.length && tokens[_i].type === TokenType.CommentSL) return 1;

        return fail(tokens[_i]);
    }

    /**
     * @returns {Array}
     */
    function getUnknown() {
        var startPos = pos;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.UnknownType, tokens[pos++].value] :
            [CSSPNodeType.UnknownType, tokens[pos++].value];
    }

    /**
     * Check if token is part of URI (e.g. `url('/css/styles.css')`)
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkUri(_i) {
        var start = _i;

        if (_i < tokens.length && tokens[_i++].value !== 'url') return fail(tokens[_i - 1]);

        if (!tokens[_i] || tokens[_i].type !== TokenType.LeftParenthesis) return fail(tokens[_i]);

        return tokens[_i].right - start + 1;
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
            uri = (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.UriType] : [CSSPNodeType.UriType])
                .concat(getSC())
                .concat([getString()])
                .concat(getSC());

            pos++;

            return uri;
        } else {
            uri = (needInfo? [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.UriType] : [CSSPNodeType.UriType])
                    .concat(getSC()),
                l = checkExcluding(uriExcluding, pos),
                raw = needInfo?
                    [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.RawType, joinValues(pos, pos + l)] :
                    [CSSPNodeType.RawType, joinValues(pos, pos + l)];

            uri.push(raw);

            pos += l + 1;

            uri = uri.concat(getSC());

            pos++;

            return uri;
        }
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkUri1(_i) {
        var start = _i,
            l = checkSC(_i);

        if (l) _i += l;

        if (tokens[_i].type !== TokenType.StringDQ && tokens[_i].type !== TokenType.StringSQ) return fail(tokens[_i]);

        _i++;

        if (l = checkSC(_i)) _i += l;

        return _i - start;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkValue(_i) {
        var start = _i,
            l;

        while (_i < tokens.length) {
            if (l = _checkValue(_i)) _i += l;
            if (!l || checkBlock(_i - l)) break;
        }

        if (_i - start) return _i - start;

        return fail(tokens[_i]);
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     * @private
     */
    function _checkValue(_i) {
        return checkSC(_i) ||
            checkInterpolation(_i) ||
            checkVariable(_i) ||
            checkVhash(_i) ||
            checkBlock(_i) ||
            checkAny(_i) ||
            checkAtkeyword(_i) ||
            checkOperator(_i) ||
            checkImportant(_i) ||
            checkDefault(_i);
    }

    /**
     * (sc | vhash | any | block | atkeyword | operator | important)+:x -> this.concat([#value], x)
     * @returns {Array}
     */
    function getValue() {
        var ss = needInfo? [{ ln: tokens[pos].ln, tn: tokens[pos].tn }, CSSPNodeType.ValueType] : [CSSPNodeType.ValueType],
            t, _pos;

        while (pos < tokens.length) {
            _pos = pos;

            if (!_checkValue(pos)) break;
            t = _getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') ss.push(t);
            else ss = ss.concat(t);

            if (checkBlock(_pos)) break;
        }

        return ss;
    }

    /**
     * @returns {Array}
     * @private
     */
    function _getValue() {
        if (checkSC(pos)) return getSC();
        else if (checkInterpolation(pos)) return getInterpolation();
        else if (checkVariable(pos)) return getVariable();
        else if (checkVhash(pos)) return getVhash();
        else if (checkBlock(pos)) return getBlock();
        else if (checkAny(pos)) return getAny();
        else if (checkAtkeyword(pos)) return getAtkeyword();
        else if (checkOperator(pos)) return getOperator();
        else if (checkImportant(pos)) return getImportant();
        else if (checkDefault(pos)) return getDefault();
    }

    /**
     * Check if token is part of a variable.
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkVariable(_i) {
        var l;

        if (syntax !== 'scss') return fail(tokens[_i]);

        if (_i >= tokens.length || tokens[_i].type !== TokenType.DollarSign) return fail(tokens[_i]);

        if (l = checkIdent(_i + 1)) return l + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node of variable
     * @returns {Array} `['variable', ['ident', x]]` where `x` is
     *      a variable name.
     */
    function getVariable() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.VariableType, getIdent()] :
            [CSSPNodeType.VariableType, getIdent()];
    }

    /**
     * Check if token is part of a variables list (e.g. `$values...`).
     * Valid only for scss syntax.
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkVariablesList(_i) {
        var d = 0,
            l;

        if (syntax !== 'scss') return fail(tokens[_i]);

        if (l = checkVariable(_i)) _i+= l;
        else return fail(tokens[_i]);

        while (tokens[_i] && tokens[_i].type === TokenType.FullStop) {
            d++;
            _i++;
        }
        if (d === 3) return l + d;
        else return fail(tokens[_i]);
    }

    /**
     * Get node with a variables list
     * @returns {Array} `['variableslist', ['variable', ['ident', x]]]` where
     *      `x` is a variable name.
     */
    function getVariablesList() {
        var startPos = pos;

        var x = needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.VariablesListType, getVariable()] :
            [CSSPNodeType.VariablesListType, getVariable()];
        pos += 3;
        return x;
    }

    /**
     * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
     *      some value
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkVhash(_i) {
        if (_i >= tokens.length || tokens[_i].type !== TokenType.NumberSign) return fail(tokens[_i]);

        var l = checkNmName2(_i + 1);

        if (l) return l + 1;

        return fail(tokens[_i]);
    }

    /**
     * Get node with a hexadecimal number (e.g. `#fff`) inside some value
     * @returns {Array} `['vhash', x]` where `x` is a hexadecimal number
     *      converted to string (without `#`, e.g. `'fff'`).
     */
    function getVhash() {
        var startPos = pos;

        pos++;

        return needInfo?
            [{ ln: tokens[startPos].ln, tn: tokens[startPos].tn }, CSSPNodeType.VhashType, getNmName2()] :
            [CSSPNodeType.VhashType, getNmName2()];
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNmName(_i) {
        var start = _i;

        // start char / word
        if (tokens[_i].type === TokenType.HyphenMinus ||
            tokens[_i].type === TokenType.LowLine ||
            tokens[_i].type === TokenType.Identifier ||
            tokens[_i].type === TokenType.DecimalNumber) _i++;
        else return fail(tokens[_i]);

        for (; _i < tokens.length; _i++) {
            if (tokens[_i].type !== TokenType.HyphenMinus &&
                tokens[_i].type !== TokenType.LowLine &&
                tokens[_i].type !== TokenType.Identifier &&
                tokens[_i].type !== TokenType.DecimalNumber) break;
        }

        tokens[start].nm_name_last = _i - 1;

        return _i - start;
    }

    /**
     * @returns {string}
     */
    function getNmName() {
        var s = joinValues(pos, tokens[pos].nm_name_last);

        pos = tokens[pos].nm_name_last + 1;

        return s;
    }

    /**
     * @param {number} _i Token's index number
     * @returns {number | undefined}
     */
    function checkNmName2(_i) {
        if (tokens[_i].type === TokenType.Identifier) return 1;
        else if (tokens[_i].type !== TokenType.DecimalNumber) return fail(tokens[_i]);

        _i++;

        if (!tokens[_i] || tokens[_i].type !== TokenType.Identifier) return 1;

        return 2;
    }

    /**
     * @returns {string}
     */
    function getNmName2() {
        var s = tokens[pos].value;

        if (tokens[pos++].type === TokenType.DecimalNumber &&
            pos < tokens.length &&
            tokens[pos].type === TokenType.Identifier
            ) s += tokens[pos++].value;

        return s;
    }

    /**
     * @param exclude
     * @param {number} _i Token's index number
     * @returns {number}
     */
    function checkExcluding(exclude, _i) {
        var start = _i;

        while(_i < tokens.length) {
            if (exclude[tokens[_i++].type]) break;
        }

        return _i - start - 2;
    }

    /**
     * @param start
     * @param finish
     * @returns {string}
     */
    function joinValues(start, finish) {
        var s = '';

        for (var i = start; i < finish + 1; i++) {
            s += tokens[i].value;
        }

        return s;
    }

    /**
     * @param start
     * @param num
     * @returns {string}
     */
    function joinValues2(start, num) {
        if (start + num - 1 >= tokens.length) return;

        var s = '';

        for (var i = 0; i < num; i++) {
            s += tokens[start + i].value;
        }

        return s;
    }

    /**
     * Mark whitespaces and comments
     */
    function markSC() {
        var ws = -1, // flag for whitespaces
            sc = -1, // flag for whitespaces and comments
            t; // current token

        // For every token in the token list, mark spaces and line breaks
        // as spaces (set both `ws` and `sc` flags). Mark multiline comments
        // with `sc` flag.
        // If there are several spaces or tabs or line breaks or multiline
        // comments in a row, group them: take the last one's index number
        // and save it to the first token in the group as a reference
        // (e.g., `ws_last = 7` for a group of whitespaces or `sc_last = 9`
        // for a group of whitespaces and comments):
        for (var i = 0; i < tokens.length; i++) {
            t = tokens[i];
            switch (t.type) {
                case TokenType.Space:
                case TokenType.Tab:
                case TokenType.Newline:
                    t.ws = true;
                    t.sc = true;

                    if (ws === -1) ws = i;
                    if (sc === -1) sc = i;

                    break;
                case TokenType.CommentML:
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

    return function(_syntax, _tokens, rule, _needInfo) {
        return _getAST(_syntax, _tokens, rule, _needInfo);
    }

}());
