syntaxes.css = {
    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAny: function(i) {
        return this.checkBraces(i) ||
            this.checkString(i) ||
            this.checkPercentage(i) ||
            this.checkDimension(i) ||
            this.checkNumber(i) ||
            this.checkUri(i) ||
            this.checkFunctionExpression(i) ||
            this.checkFunction(i) ||
            this.checkIdent(i) ||
            this.checkClass(i) ||
            this.checkUnary(i);
    },

    /**
     * @returns {Array}
     */
    getAny: function() {
        if (this.checkBraces(pos)) return this.getBraces();
        else if (this.checkString(pos)) return this.getString();
        else if (this.checkPercentage(pos)) return this.getPercentage();
        else if (this.checkDimension(pos)) return this.getDimension();
        else if (this.checkNumber(pos)) return this.getNumber();
        else if (this.checkUri(pos)) return this.getUri();
        else if (this.checkFunctionExpression(pos)) return this.getFunctionExpression();
        else if (this.checkFunction(pos)) return this.getFunction();
        else if (this.checkIdent(pos)) return this.getIdent();
        else if (this.checkClass(pos)) return this.getClass();
        else if (this.checkUnary(pos)) return this.getUnary();
    },

    /**
     * Check if token is part of an @-word (e.g. `@import`, `@include`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAtkeyword: function(i) {
        var l;

        // Check that token is `@`:
        if (i >= tokensLength ||
            tokens[i++].type !== TokenType.CommercialAt) return 0;

        return (l = this.checkIdent(i)) ? l + 1 : 0;
    },

    /**
     * Get node with @-word
     * @returns {Array} `['atkeyword', ['ident', x]]` where `x` is an identifier without
     *      `@` (e.g. `import`, `include`)
     */
    getAtkeyword: function() {
        var startPos = pos,
            x;

        pos++;

        x = [NodeType.AtkeywordType, this.getIdent()];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of an attribute selector (e.g. `[attr]`,
     *      `[attr='panda']`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAttrib: function(i) {
        if (i >= tokensLength ||
            tokens[i].type !== TokenType.LeftSquareBracket ||
            !tokens[i].right) return 0;

        return tokens[i].right - i + 1;
    },

    /**
    * Get node with an attribute selector
    * @returns {Array} `['attrib', ['ident', x], ['attrselector', y]*, [z]*]`
    *      where `x` is attribute's name, `y` is operator (if there is any)
    *      and `z` is attribute's value (if there is any)
    */
    getAttrib: function() {
        if (this.checkAttrib1(pos)) return this.getAttrib1();
        if (this.checkAttrib2(pos)) return this.getAttrib2();
    },

    /**
     * Check if token is part of an attribute selector of the form `[attr='value']`
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAttrib1: function(i) {
        var start = i,
            l;

        if (i++ >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkAttrselector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i) || this.checkString(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return tokens[i].type === TokenType.RightSquareBracket ? i - start : 0;
    },

    /**
     * Get node with an attribute selector of the form `[attr='value']`
     * @returns {Array} `['attrib', ['ident', x], ['attrselector', y], [z]]`
     *      where `x` is attribute's name, `y` is operator and `z` is attribute's
     *      value
     */
    getAttrib1: function() {
        var startPos = pos,
            x;

        pos++;

        x = [NodeType.AttribType]
            .concat(this.getSC())
            .concat([this.getIdent()])
            .concat(this.getSC())
            .concat([this.getAttrselector()])
            .concat(this.getSC())
            .concat([this.checkString(pos)? this.getString() : this.getIdent()])
            .concat(this.getSC());

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of an attribute selector of the form `[attr]`
     * Attribute can not be empty, e.g. `[]`.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAttrib2: function(i) {
        var start = i,
            l;

        if (i++ >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return tokens[i].type === TokenType.RightSquareBracket ? i - start : 0;
    },

    /**
     * Get node with an attribute selector of the form `[attr]`
     * @returns {Array} `['attrib', ['ident', x]]` where `x` is attribute's name
     */
    getAttrib2: function() {
        var startPos = pos,
            x;

        pos++;

        x = [NodeType.AttribType]
            .concat(this.getSC())
            .concat([this.getIdent()])
            .concat(this.getSC());

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of an attribute selector operator (`=`, `~=`,
     *      `^=`, `$=`, `*=` or `|=`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of operator (`0` if token is not part of an
     *       operator, `1` or `2` if it is).
     */
    checkAttrselector: function(i) {
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
    },

    /**
     * Get node with an attribute selector operator (`=`, `~=`, `^=`, `$=`,
     *      `*=` or `|=`)
     * @returns {Array} `['attrselector', x]` where `x` is an operator.
     */
    getAttrselector: function() {
        var startPos = pos,
            s = tokens[pos++].value,
            x;

        if (tokens[pos] && tokens[pos].type === TokenType.EqualsSign) s += tokens[pos++].value;

        x = [NodeType.AttrselectorType, s];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a part of an @-rule
     * @param {Number} i Token's index number
     * @returns {Number} Length of @-rule
     */
    checkAtrule: function(i) {
        var l;

        if (i >= tokensLength) return 0;

        // If token already has a record of being part of an @-rule,
        // return the @-rule's length:
        if (tokens[i].atrule_l !== undefined) return tokens[i].atrule_l;

        // If token is part of an @-rule, save the rule's type to token:
        if (l = this.checkAtruler(i)) tokens[i].atrule_type = 1; // @-rule with ruleset
        else if (l = this.checkAtruleb(i)) tokens[i].atrule_type = 2; // block @-rule
        else if (l = this.checkAtrules(i)) tokens[i].atrule_type = 3; // single-line @-rule
        else return 0;

        // If token is part of an @-rule, save the rule's length to token:
        tokens[i].atrule_l = l;

        return l;
    },

    /**
     * Get node with @-rule
     * @returns {Array}
     */
    getAtrule: function() {
        switch (tokens[pos].atrule_type) {
            case 1: return this.getAtruler(); // @-rule with ruleset
            case 2: return this.getAtruleb(); // block @-rule
            case 3: return this.getAtrules(); // single-line @-rule
        }
    },

    /**
     * Check if token is part of a block @-rule
     * @param {Number} i Token's index number
     * @returns {Number} Length of the @-rule
     */
    checkAtruleb: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (l = this.checkTsets(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else return 0;

        return i - start;
    },

    /**
     * Get node with a block @-rule
     * @returns {Array} `['atruleb', ['atkeyword', x], y, ['block', z]]`
     */
    getAtruleb: function() {
        var startPos = pos,
            x;

        x = [NodeType.AtrulebType, this.getAtkeyword()]
            .concat(this.getTsets())
            .concat([this.getBlock()]);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of an @-rule with ruleset
     * @param {Number} i Token's index number
     * @returns {Number} Length of the @-rule
     */
    checkAtruler: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (l = this.checkAtrulerq(i)) i += l;

        if (i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket) i++;
        else return 0;

        if (l = this.checkAtrulers(i)) i += l;

        if (i < tokensLength && tokens[i].type === TokenType.RightCurlyBracket) i++;
        else return 0;

        return i - start;
    },

    /**
     * Get node with an @-rule with ruleset
     * @returns {Array} ['atruler', ['atkeyword', x], y, z]
     */
    getAtruler: function() {
        var startPos = pos,
            x;

        x = [NodeType.AtrulerType, this.getAtkeyword(), this.getAtrulerq()];

        pos++;

        x.push(this.getAtrulers());

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAtrulerq: function(i) {
        return this.checkTsets(i);
    },

    /**
     * @returns {Array} `['atrulerq', x]`
     */
    getAtrulerq: function() {
        var startPos = pos,
            x;

        x = [NodeType.AtrulerqType].concat(this.getTsets());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAtrulers: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        while (l = this.checkRuleset(i) || this.checkAtrule(i) || this.checkSC(i)) {
            i += l;
        }

        tokens[i].atrulers_end = 1;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array} `['atrulers', x]`
     */
    getAtrulers: function() {
        var startPos = pos,
            x;

        x = [NodeType.AtrulersType].concat(this.getSC());

        while (!tokens[pos].atrulers_end) {
            if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkRuleset(pos)) x.push(this.getRuleset());
            else x.push(this.getAtrule());
        }

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkAtrules: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (l = this.checkTsets(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array} `['atrules', ['atkeyword', x], y]`
     */
    getAtrules: function() {
        var startPos = pos,
            x;

        x = [NodeType.AtrulesType, this.getAtkeyword()].concat(this.getTsets());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a block (e.g. `{...}`).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the block
     */
    checkBlock: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.LeftCurlyBracket ?
            tokens[i].right - i + 1 : 0;
    },

    /**
     * Get node with a block
     * @returns {Array} `['block', x]`
     */
    getBlock: function() {
        var startPos = pos,
            end = tokens[pos].right,
            x = [NodeType.BlockType];

        pos++;


        while (pos < end) {
            if (this.checkBlockdecl(pos)) x = x.concat(this.getBlockdecl());
            else throwError();
        }

        pos = end + 1;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    checkBlockdecl: function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (l = this.checkBlockdecl1(i)) tokens[i].bd_type = 1;
        else if (l = this.checkBlockdecl2(i)) tokens[i].bd_type = 2;
        else if (l = this.checkBlockdecl3(i)) tokens[i].bd_type = 3;
        else if (l = this.checkBlockdecl4(i)) tokens[i].bd_type = 4;
        else return 0;

        return l;
    },

    /**
     * @returns {Array}
     */
    getBlockdecl: function() {
        switch (tokens[pos].bd_type) {
            case 1: return this.getBlockdecl1();
            case 2: return this.getBlockdecl2();
            case 3: return this.getBlockdecl3();
            case 4: return this.getBlockdecl4();
        }
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkBlockdecl1: function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkFilter(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 2;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 3;
        else return 0;

        i += l;

        if (i < tokensLength && (l = this.checkDeclDelim(i))) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        return i - start;
    },

    /**
     * sc*:s0 (atrule | ruleset | filter | declaration):x declDelim:y sc*:s1 -> this.concat(s0, [x], [y], s1)
     * @returns {Array}
     */
    getBlockdecl1: function() {
        var sc = this.getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = this.getFilter();
                break;
            case 2:
                x = this.getDeclaration();
                break;
            case 3:
                x = this.getAtrule();
                break;
        }

        return sc
            .concat([x])
            .concat([this.getDeclDelim()])
            .concat(this.getSC());
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkBlockdecl2: function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkFilter(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 2;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 3;
        else return 0;

        i += l;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getBlockdecl2: function() {
        var sc = this.getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = this.getFilter();
                break;
            case 2:
                x = this.getDeclaration();
                break;
            case 3:
                x = this.getAtrule();
                break;
        }

        return sc
            .concat([x])
            .concat(this.getSC());
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkBlockdecl3: function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkDeclDelim(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array} `[s0, ['declDelim'], s1]` where `s0` and `s1` are
     *      are optional whitespaces.
     */
    getBlockdecl3: function() {
        return this.getSC()
            .concat([this.getDeclDelim()])
            .concat(this.getSC());
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkBlockdecl4: function(i) {
        return this.checkSC(i);
    },

    /**
     * @returns {Array}
     */
    getBlockdecl4: function() {
        return this.getSC();
    },

    /**
     * Check if token is part of text inside parentheses or square brackets
     *      (e.g. `(1)`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkBraces: function(i) {
        if (i >= tokensLength ||
            (tokens[i].type !== TokenType.LeftParenthesis &&
            tokens[i].type !== TokenType.LeftSquareBracket)) return 0;

        return tokens[i].right - i + 1;
    },

    /**
     * Get node with text inside parentheses or square brackets (e.g. `(1)`)
     * @returns {Array} `['braces', l, r, x*]` where `l` is a left bracket
     *      (e.g. `'('`), `r` is a right bracket (e.g. `')'`) and `x` is
     *      parsed text inside those brackets (if there is any)
     *      (e.g. `['number', '1']`)
     */
    getBraces: function() {
        var startPos = pos,
            left = pos,
            right = tokens[pos].right,
            x;

        pos++;

        var tsets = this.getTsets();

        pos++;

        x = [NodeType.BracesType, tokens[left].value, tokens[right].value]
            .concat(tsets);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a class selector (e.g. `.abc`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the class selector
     */
    checkClass: function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (tokens[i].class_l) return tokens[i].class_l;

        if (tokens[i++].type === TokenType.FullStop && (l = this.checkIdent(i))) {
            tokens[i].class_l = l + 1;
            return l + 1;
        }

        return 0;
    },

    /**
     * Get node with a class selector
     * @returns {Array} `['class', ['ident', x]]` where x is a class's
     *      identifier (without `.`, e.g. `abc`).
     */
    getClass: function() {
        var startPos = pos,
            x = [NodeType.ClassType];

        pos++;

        x.push(this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a combinator (`+`, `>` or `~`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the combinator
     */
    checkCombinator: function(i) {
        if (i >= tokensLength) return 0;

        switch (tokens[i].type) {
            case TokenType.PlusSign:
            case TokenType.GreaterThanSign:
            case TokenType.Tilde:
                return 1;
        }

        return 0;
    },

    /**
     * Get node with a combinator (`+`, `>` or `~`)
     * @returns {Array} `['combinator', x]` where `x` is a combinator
     *      converted to string.
     */
    getCombinator: function() {
        var startPos = pos,
            x;

        x = [NodeType.CombinatorType, tokens[pos++].value];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a multiline comment.
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a multiline comment, otherwise `0`
     */
    checkCommentML: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.CommentML ? 1 : 0;
    },

    /**
     * Get node with a multiline comment
     * @returns {Array} `['commentML', x]` where `x`
     *      is the comment's text (without `/*` and `* /`).
     */
    getCommentML: function() {
        var startPos = pos,
            s = tokens[pos].value.substring(2),
            l = s.length,
            x;

        if (s.charAt(l - 2) === '*' && s.charAt(l - 1) === '/') s = s.substring(0, l - 2);

        pos++;

        x = [NodeType.CommentMLType, s];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    checkDeclaration: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkProperty(i)) i += l;
        else return 0;

        if (l = this.checkPropertyDelim(i)) i++;
        else return 0;

        if (l = this.checkValue(i)) i += l;
        else return 0;

        return i - start;
    },

    /**
     * Get node with a declaration
     * @returns {Array} `['declaration', ['property', x], ['propertyDelim'],
     *       ['value', y]]`
     */
    getDeclaration: function() {
        var startPos = pos,
            x = [NodeType.DeclarationType];

        x.push(this.getProperty());
        x.push(this.getPropertyDelim());
        x.push(this.getValue());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a semicolon
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a semicolon, otherwise `0`
     */
    checkDeclDelim: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.Semicolon ? 1 : 0;
    },

    /**
     * Get node with a semicolon
     * @returns {Array} `['declDelim']`
     */
    getDeclDelim: function() {
        var startPos = pos,
            x = [NodeType.DeclDelimType];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a comma
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a comma, otherwise `0`
     */
    checkDelim: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.Comma ? 1 : 0;
    },

    /**
     * Get node with a comma
     * @returns {Array} `['delim']`
     */
    getDelim: function() {
        var startPos = pos,
            x = [NodeType.DelimType];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a number with dimension unit (e.g. `10px`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkDimension: function(i) {
        var ln = this.checkNumber(i),
            li;

        if (i >= tokensLength ||
            !ln ||
            i + ln >= tokensLength) return 0;

        return (li = this.checkNmName2(i + ln)) ? ln + li : 0;
    },

    /**
     * Get node of a number with dimension unit
     * @returns {Array} `['dimension', ['number', x], ['ident', y]]` where
     *      `x` is a number converted to string (e.g. `'10'`) and `y` is
     *      a dimension unit (e.g. `'px'`).
     */
    getDimension: function() {
        var startPos = pos,
            x = [NodeType.DimensionType, this.getNumber()],
            ident = [NodeType.IdentType, this.getNmName2()];

        if (needInfo) ident.unshift(getInfo(startPos));

        x.push(ident);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkFilter: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkFilterp(i)) i += l;
        else return 0;

        if (tokens[i].type === TokenType.Colon) i++;
        else return 0;

        if (l = this.checkFilterv(i)) i += l;
        else return 0;

        return i - start;
    },

    /**
     * @returns {Array} `['filter', x, y]`
     */
    getFilter: function() {
        var startPos = pos,
            x = [NodeType.FilterType, this.getFilterp()];

        pos++;

        x.push(this.getFilterv());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkFilterp: function(i) {
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

        if (this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getFilterp: function() {
        var startPos = pos,
            ident = [NodeType.IdentType, joinValues2(pos, tokens[pos].filterp_l)],
            x;

        if (needInfo) ident.unshift(getInfo(startPos));

        pos += tokens[pos].filterp_l;

        x = [NodeType.PropertyType, ident].concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkFilterv: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkProgid(i)) i += l;
        else return 0;

        while (l = this.checkProgid(i)) {
            i += l;
        }

        tokens[start].last_progid = i;

        if (i < tokensLength && (l = this.checkSC(i))) i += l;

        if (i < tokensLength && (l = this.checkImportant(i))) i += l;

        return i - start;
    },

    /**
     * progid+:x -> [#filterv].concat(x)
     * @returns {Array}
     */
    getFilterv: function() {
        var startPos = pos,
            x = [NodeType.FiltervType],
            last_progid = tokens[pos].last_progid;

        x = x.concat(this.getSC());

        while (pos < last_progid) {
            x.push(this.getProgid());
        }

        if (this.checkSC(pos)) x = x.concat(this.getSC());

        if (pos < tokensLength && this.checkImportant(pos)) x.push(this.getImportant());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkFunctionExpression: function(i) {
        var start = i;

        if (i >= tokensLength || tokens[i++].value !== 'expression' ||
            i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis) return 0;

        return tokens[i].right - start + 1;
    },

    /**
     * @returns {Array}
     */
    getFunctionExpression: function() {
        var startPos = pos,
            x, e;

        pos++;

        e = joinValues(pos + 1, tokens[pos].right - 1);

        pos = tokens[pos].right + 1;

        x = [NodeType.FunctionExpressionType, e];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkFunction: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkIdent(i)) i +=l;
        else return 0;

        return i < tokensLength && tokens[i].type === TokenType.LeftParenthesis ?
            tokens[i].right - start + 1 : 0;
    },

    /**
     * @returns {Array}
     */
    getFunction: function() {
        var startPos = pos,
            ident = this.getIdent(),
            x = [NodeType.FunctionType, ident],
            body;

        body = ident[needInfo ? 2 : 1] === 'not' ? this.getNotArguments() : this.getArguments();

        x.push(body);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @returns {Array}
     */
    getArguments: function() {
        var startPos = pos,
            x = [NodeType.ArgumentsType],
            body;

        pos++;

        while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
            if (this.checkDeclaration(pos)) x.push(this.getDeclaration());
            else if (this.checkArgument(pos)) {
                body = this.getArgument();
                if ((needInfo && typeof body[1] === 'string') || typeof body[0] === 'string') x.push(body);
                else x = x.concat(body);
            } else if (this.checkClass(pos)) x.push(this.getClass());
            else throwError();
        }

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkArgument: function(i) {
        return this.checkVhash(i) ||
            this.checkAny(i) ||
            this.checkSC(i) ||
            this.checkOperator(i);
    },

    /**
     * @returns {Array}
     */
    getArgument: function() {
        if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkSC(pos)) return this.getSC();
        else if (this.checkOperator(pos)) return this.getOperator();
    },

    /**
     * @returns {Array}
     */
    getNotArguments: function() {
        var startPos = pos,
            x = [NodeType.ArgumentsType];

        pos++;

        while (pos < tokensLength && tokens[pos].type !== TokenType.RightParenthesis) {
            if (this.checkSimpleSelector(pos)) x.push(this.getSimpleSelector());
            else throwError();
        }

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of an identifier
     * @param {Number} i Token's index number
     * @returns {Number} Length of the identifier
     */
    checkIdent: function(i) {
        var start = i,
            wasIdent,
            l;

        if (i >= tokensLength) return 0;

        // Check if token is part of an identifier starting with `_`:
        if (tokens[i].type === TokenType.LowLine) return this.checkIdentLowLine(i);

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
    },

    /**
     * Check if token is part of an identifier starting with `_`
     * @param {Number} i Token's index number
     * @returns {Number} Length of the identifier
     */
    checkIdentLowLine: function(i) {
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
    },

    /**
     * Get node with an identifier
     * @returns {Array} `['ident', x]` where `x` is identifier's name
     */
    getIdent: function() {
        var startPos = pos,
            x = [NodeType.IdentType, joinValues(pos, tokens[pos].ident_last)];

        pos = tokens[pos].ident_last + 1;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of `!important` word
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkImportant: function(i) {
        var start = i,
            l;

        if (i >= tokensLength ||
            tokens[i++].type !== TokenType.ExclamationMark) return 0;

        if (l = this.checkSC(i)) i += l;

        return tokens[i].value === 'important' ? i - start + 1 : 0;
    },

    /**
     * Get node with `!important` word
     * @returns {Array} `['important', sc]` where `sc` is optional whitespace
     */
    getImportant: function() {
        var startPos = pos,
            x = [NodeType.ImportantType];

        pos++;

        x = x.concat(this.getSC());

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a namespace sign (`|`)
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is `|`, `0` if not
     */
    checkNamespace: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.VerticalLine ? 1 : 0;
    },

    /**
     * Get node with a namespace sign
     * @returns {Array} `['namespace']`
     */
    getNamespace: function() {
        var startPos = pos,
            x = [NodeType.NamespaceType];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNmName: function(i) {
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
    },

    /**
     * @returns {String}
     */
    getNmName: function() {
        var s = joinValues(pos, tokens[pos].nm_name_last);

        pos = tokens[pos].nm_name_last + 1;

        return s;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNmName2: function(i) {
        if (tokens[i].type === TokenType.Identifier) return 1;
        else if (tokens[i].type !== TokenType.DecimalNumber) return 0;

        i++;

        return i < tokensLength && tokens[i].type === TokenType.Identifier ? 2 : 1;
    },

    /**
     * @returns {String}
     */
    getNmName2: function() {
        var s = tokens[pos].value;

        if (tokens[pos++].type === TokenType.DecimalNumber &&
            pos < tokensLength &&
            tokens[pos].type === TokenType.Identifier) s += tokens[pos++].value;

        return s;
    },

    /**
     * Check if token is part of an nth-selector's identifier (e.g. `2n+1`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNth: function(i) {
        if (i >= tokensLength) return 0;

        return this.checkNth1(i) || this.checkNth2(i);
    },

    /**
     * Check if token is part of an nth-selector's identifier in the form of
     *      sequence of decimals and n-s (e.g. `3`, `n`, `2n+1`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNth1: function(i) {
        var start = i;

        for (; i < tokensLength; i++) {
            if (tokens[i].type !== TokenType.DecimalNumber &&
                tokens[i].value !== 'n') break;
        }

        if (i !== start) tokens[start].nth_last = i - 1;

        return i - start;
    },

    /**
     * Get node for nth-selector's identifier (e.g. `2n+1`)
     * @returns {Array} `['nth', x]` where `x` is identifier's text
     */
    getNth: function() {
        var startPos = pos,
            x = [NodeType.NthType];

        if (tokens[pos].nth_last) {
            x.push(joinValues(pos, tokens[pos].nth_last));
            pos = tokens[pos].nth_last + 1;
        } else {
            x.push(tokens[pos++].value);
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of `even` or `odd` nth-selector's identifier
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNth2: function(i) {
        return tokens[i].value === 'even' || tokens[i].value === 'odd' ? 1 : 0;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNthf: function(i) {
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
    },

    /**
     * @returns {String}
     */
    getNthf: function() {
        pos++;

        var s = joinValues(pos, tokens[pos].nthf_last);

        pos = tokens[pos].nthf_last + 1;

        return s;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkNthselector: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkNthf(i)) i += l;
        else return 0;

        if (tokens[i].type !== TokenType.LeftParenthesis || !tokens[i].right) return 0;

        l++;

        var rp = tokens[i++].right;

        while (i < rp) {
            if (l = this.checkSC(i) ||
                this.checkUnary(i) ||
                this.checkNth(i)) i += l;
            else return 0;
        }

        return rp - start + 1;
    },

    /**
     * @returns {Array}
     */
    getNthselector: function() {
        var startPos = pos,
            nthf = [NodeType.IdentType, this.getNthf()],
            x = [NodeType.NthselectorType];

        if (needInfo) nthf.unshift(getInfo(startPos));

        x.push(nthf);

        pos++;

        while (tokens[pos].type !== TokenType.RightParenthesis) {
            if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkUnary(pos)) x.push(this.getUnary());
            else if (this.checkNth(pos)) x.push(this.getNth());
        }

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a number
     * @param {Number} i Token's index number
     * @returns {Number} Length of number
     */
    checkNumber: function(i) {
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
    },

    /**
     * Get node with number
     * @returns {Array} `['number', x]` where `x` is a number converted
     *      to string.
     */
    getNumber: function() {
        var s = '',
            startPos = pos,
            l = tokens[pos].number_l,
            x = [NodeType.NumberType];

        for (var j = 0; j < l; j++) {
            s += tokens[pos + j].value;
        }

        pos += l;

        x.push(s);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is an operator (`/`, `,`, `:` or `=`).
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is an operator, otherwise `0`
     */
    checkOperator: function(i) {
        if (i >= tokensLength) return 0;

        switch(tokens[i].type) {
            case TokenType.Solidus:
            case TokenType.Comma:
            case TokenType.Colon:
            case TokenType.EqualsSign:
                return 1;
        }

        return 0;
    },

    /**
     * Get node with an operator
     * @returns {Array} `['operator', x]` where `x` is an operator converted
     *      to string.
     */
    getOperator: function() {
        var startPos = pos,
            x = [NodeType.OperatorType, tokens[pos++].value];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a number with percent sign (e.g. `10%`)
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkPercentage: function(i) {
        var x;

        if (i >= tokensLength) return 0;

        x = this.checkNumber(i);

        if (!x || i + x >= tokensLength) return 0;

        return tokens[i + x].type === TokenType.PercentSign ? x + 1 : 0;
    },

    /**
     * Get node of number with percent sign
     * @returns {Array} `['percentage', ['number', x]]` where `x` is a number
     *      (without percent sign) converted to string.
     */
    getPercentage: function() {
        var startPos = pos,
            x = [NodeType.PercentageType, this.getNumber()];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkProgid: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (joinValues2(i, 6) === 'progid:DXImageTransform.Microsoft.') i += 6;
        else return 0;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (tokens[i].type === TokenType.LeftParenthesis) {
            tokens[start].progid_end = tokens[i].right;
            i = tokens[i].right + 1;
        } else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getProgid: function() {
        var startPos = pos,
            progid_end = tokens[pos].progid_end,
            x;

        x = [NodeType.ProgidType]
            .concat(this.getSC())
            .concat([this._getProgid(progid_end)])
            .concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} progid_end
     * @returns {Array}
     */
    _getProgid: function(progid_end) {
        var startPos = pos,
            x = [NodeType.RawType, joinValues(pos, progid_end)];

        pos = progid_end + 1;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a property
     * @param {Number} i Token's index number
     * @returns {Number} Length of the property
     */
    checkProperty: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * Get node with a property
     * @returns {Array} `['property', x]`
     */
    getProperty: function() {
        var startPos = pos,
            x = [NodeType.PropertyType];

        x.push(this.getIdent());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a colon
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a colon, otherwise `0`
     */
    checkPropertyDelim: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.Colon ? 1 : 0;
    },

    /**
     * Get node with a colon
     * @returns {Array} `['propertyDelim']`
     */
    getPropertyDelim: function() {
        var startPos = pos,
            x = [NodeType.PropertyDelimType];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkPseudo: function(i) {
        return this.checkPseudoe(i) ||
            this.checkPseudoc(i);
    },

    /**
     * @returns {Array}
     */
    getPseudo: function() {
        if (this.checkPseudoe(pos)) return this.getPseudoe();
        if (this.checkPseudoc(pos)) return this.getPseudoc();
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkPseudoe: function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon ||
            i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkIdent(i)) ? l + 2 : 0;
    },

    /**
     * @returns {Array}
     */
    getPseudoe: function() {
        var startPos = pos,
            x = [NodeType.PseudoeType];

        pos += 2;

        x.push(this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkPseudoc: function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkFunction(i) || this.checkIdent(i)) ? l + 1 : 0;
    },

    /**
     * @returns {Array}
     */
    getPseudoc: function() {
        var startPos = pos,
            x = [NodeType.PseudocType];

        pos ++;

        x.push(this.checkFunction(pos) ? this.getFunction() : this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkRuleset: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (tokens[start].ruleset_l) return tokens[start].ruleset_l;

        while (i < tokensLength) {
            if (l = this.checkBlock(i)) {i += l; break;}
            else if (l = this.checkSelector(i)) i += l;
            else return 0;
        }

        tokens[start].ruleset_l = i - start;

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getRuleset: function() {
        var startPos = pos,
            x = [NodeType.RulesetType];

        while (pos < tokensLength) {
            if (this.checkBlock(pos)) {x.push(this.getBlock()); break;}
            else if (this.checkSelector(pos)) x.push(this.getSelector());
            else break;
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is marked as a space (if it's a space or a tab
     *      or a line break).
     * @param i
     * @returns {Number} Number of spaces in a row starting with the given token.
     */
    checkS: function(i) {
        return i < tokensLength && tokens[i].ws ? tokens[i].ws_last - i + 1 : 0;
    },

    /**
     * Get node with spaces
     * @returns {Array} `['s', x]` where `x` is a string containing spaces
     */
    getS: function() {
        var startPos = pos,
            x = [NodeType.SType, joinValues(pos, tokens[pos].ws_last)];

        pos = tokens[pos].ws_last + 1;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is a space or a comment.
     * @param {Number} i Token's index number
     * @returns {Number} Number of similar (space or comment) tokens
     *      in a row starting with the given token.
     */
    checkSC: function(i) {
        var l,
            lsc = 0;

        while (i < tokensLength) {
            if (!(l = this.checkS(i)) &&
                !(l = this.checkCommentML(i))) break;
            i += l;
            lsc += l;
        }

        return lsc || 0;
    },

    /**
     * Get node with spaces and comments
     * @returns {Array} Array containing nodes with spaces (if there are any)
     *      and nodes with comments (if there are any):
     *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
     *      and `y` is a comment's text (without `/*` and `* /`).
     */
    getSC: function() {
        var sc = [];

        if (pos >= tokensLength) return sc;

        while (pos < tokensLength) {
            if (this.checkS(pos)) sc.push(this.getS());
            else if (this.checkCommentML(pos)) sc.push(this.getCommentML());
            else break;
        }

        return sc;
    },

    /**
     * Check if token is part of a selector
     * @param {Number} i Token's index number
     * @returns {Number} Length of the selector
     */
    checkSelector: function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this.checkSimpleSelector(i) || this.checkDelim(i))  i += l;
            else break;
        }

        if (i !== start) tokens[start].selector_end = i - 1;

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getSelector: function() {
        var startPos = pos,
            x = [NodeType.SelectorType],
            selector_end = tokens[pos].selector_end;

        while (pos <= selector_end) {
            x.push(this.checkDelim(pos) ? this.getDelim() : this.getSimpleSelector());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
     *      a simple selector
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkShash: function(i) {
        var l;

        if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

        return (l = this.checkNmName(i + 1)) ? l + 1 : 0;
    },

    /**
     * Get node with a hexadecimal number (e.g. `#fff`) inside a simple
     *      selector
     * @returns {Array} `['shash', x]` where `x` is a hexadecimal number
     *      converted to string (without `#`, e.g. `fff`)
     */
    getShash: function() {
        var startPos = pos,
            x = [NodeType.ShashType];

        pos++;

        x.push(this.getNmName());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkSimpleSelector: function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this.checkSimpleSelector1(i)) i += l;
            else break;
        }

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getSimpleSelector: function() {
        var startPos = pos,
            x = [NodeType.SimpleselectorType],
            t;

        while (pos < tokensLength) {
            if (!this.checkSimpleSelector1(pos)) break;
            t = this.getSimpleSelector1();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
    * @param {Number} i Token's index number
    * @returns {Number}
    */
    checkSimpleSelector1: function(i) {
        return this.checkNthselector(i) ||
            this.checkCombinator(i) ||
            this.checkAttrib(i) ||
            this.checkPseudo(i) ||
            this.checkShash(i) ||
            this.checkAny(i) ||
            this.checkSC(i) ||
            this.checkNamespace(i);
    },

    /**
     * @returns {Array}
     */
    getSimpleSelector1: function() {
        if (this.checkNthselector(pos)) return this.getNthselector();
        else if (this.checkCombinator(pos)) return this.getCombinator();
        else if (this.checkAttrib(pos)) return this.getAttrib();
        else if (this.checkPseudo(pos)) return this.getPseudo();
        else if (this.checkShash(pos)) return this.getShash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkSC(pos)) return this.getSC();
        else if (this.checkNamespace(pos)) return this.getNamespace();
    },

    /**
     * Check if token is part of a string (text wrapped in quotes)
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is part of a string, `0` if not
     */
    checkString: function(i) {
        return i < tokensLength && (tokens[i].type === TokenType.StringSQ || tokens[i].type === TokenType.StringDQ) ? 1 : 0;
    },

    /**
     * Get string's node
     * @returns {Array} `['string', x]` where `x` is a string (including
     *      quotes).
     */
    getString: function() {
        var startPos = pos,
            x = [NodeType.StringType, tokens[pos++].value];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Validate stylesheet: it should consist of any number (0 or more) of
     * rulesets (sets of rules with selectors), @-rules, whitespaces or
     * comments.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkStylesheet: function(i) {
        var start = i,
            l;

        // Check every token:
        while (i < tokensLength) {
            if (l = this.checkSC(i) ||
                this.checkDeclDelim(i) ||
                this.checkAtrule(i) ||
                this.checkRuleset(i) ||
                this.checkUnknown(i)) i += l;
            else throwError(i);
        }

        return i - start;
    },

    /**
     * @returns {Array} `['stylesheet', x]` where `x` is all stylesheet's
     *      nodes.
     */
    getStylesheet: function() {
        var startPos = pos,
            x = [NodeType.StylesheetType];

        while (pos < tokensLength) {
            if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkRuleset(pos)) x.push(this.getRuleset());
            else if (this.checkAtrule(pos)) x.push(this.getAtrule());
            else if (this.checkDeclDelim(pos)) x.push(this.getDeclDelim());
            else if (this.checkUnknown(pos)) x.push(this.getUnknown());
            else throwError();
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkTset: function(i) {
        return this.checkVhash(i) ||
            this.checkAny(i) ||
            this.checkSC(i) ||
            this.checkOperator(i);
    },

    /**
     * @returns {Array}
     */
    getTset: function() {
        if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkSC(pos)) return this.getSC();
        else if (this.checkOperator(pos)) return this.getOperator();
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkTsets: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        while (l = this.checkTset(i)) {
            i += l;
        }

        return i - start;
    },

    /**
     * @returns {Array}
     */
    getTsets: function() {
        var x = [],
            t;

        while (t = this.getTset()) {
            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return x;
    },

    /**
     * Check if token is an unary (arithmetical) sign (`+` or `-`)
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is an unary sign, `0` if not
     */
    checkUnary: function(i) {
        return i < tokensLength && (tokens[i].type === TokenType.HyphenMinus || tokens[i].type === TokenType.PlusSign) ? 1 : 0;
    },

    /**
     * Get node with an unary (arithmetical) sign (`+` or `-`)
     * @returns {Array} `['unary', x]` where `x` is an unary sign
     *      converted to string.
     */
    getUnary: function() {
        var startPos = pos,
            x = [NodeType.UnaryType, tokens[pos++].value];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkUnknown: function(i) {
        return i < tokensLength && tokens[i].type === TokenType.CommentSL ? 1 : 0;
    },

    /**
     * @returns {Array}
     */
    getUnknown: function() {
        var startPos = pos,
            x = [NodeType.UnknownType, tokens[pos++].value];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Check if token is part of URI (e.g. `url('/css/styles.css')`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of URI
     */
    checkUri: function(i) {
        var start = i;

        if (i >= tokensLength || tokens[i++].value !== 'url' ||
            i >= tokensLength || tokens[i].type !== TokenType.LeftParenthesis)
            return 0;

        return tokens[i].right - start + 1;
    },

    /**
     * Get node with URI
     * @returns {Array} `['uri', x]` where `x` is URI's nodes (without `url`
     *      and braces, e.g. `['string', ''/css/styles.css'']`).
     */
    getUri: function() {
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

        if (this.checkUri1(pos)) {
            uri = [NodeType.UriType]
                .concat(this.getSC())
                .concat([this.getString()])
                .concat(this.getSC());

            pos++;
        } else {
            uri = [NodeType.UriType].concat(this.getSC()),
            l = checkExcluding(uriExcluding, pos),
            raw = [NodeType.RawType, joinValues(pos, pos + l)];

            if (needInfo) raw.unshift(getInfo(startPos));

            uri.push(raw);

            pos += l + 1;

            uri = uri.concat(this.getSC());

            pos++;
        }

        return needInfo ? (uri.unshift(getInfo(startPos)), uri) : uri;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkUri1: function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (tokens[i].type !== TokenType.StringDQ && tokens[i].type !== TokenType.StringSQ) return 0;

        i++;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    },

    /**
     * Check if token is part of a value
     * @param {Number} i Token's index number
     * @returns {Number} Length of the value
     */
    checkValue: function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this._checkValue(i)) i += l;
            else break;
        }

        return i - start;
    },

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    _checkValue: function(i) {
        return this.checkSC(i) ||
            this.checkVhash(i) ||
            this.checkAny(i) ||
            this.checkOperator(i) ||
            this.checkImportant(i);
    },

    /**
     * @returns {Array}
     */
    getValue: function() {
        var startPos = pos,
            x = [NodeType.ValueType],
            t,
            _pos;

        while (pos < tokensLength) {
            _pos = pos;

            if (!this._checkValue(pos)) break;
            t = this._getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * @returns {Array}
     */
    _getValue: function() {
        if (this.checkSC(pos)) return this.getSC();
        else if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkOperator(pos)) return this.getOperator();
        else if (this.checkImportant(pos)) return this.getImportant();
    },

    /**
     * Check if token is part of a hexadecimal number (e.g. `#fff`) inside
     *      some value
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    checkVhash: function(i) {
        var l;

        if (i >= tokensLength || tokens[i].type !== TokenType.NumberSign) return 0;

        return (l = this.checkNmName2(i + 1)) ? l + 1 : 0;
    },

    /**
     * Get node with a hexadecimal number (e.g. `#fff`) inside some value
     * @returns {Array} `['vhash', x]` where `x` is a hexadecimal number
     *      converted to string (without `#`, e.g. `'fff'`).
     */
    getVhash: function() {
        var startPos = pos,
            x = [NodeType.VhashType];

        pos++;

        x.push(this.getNmName2());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    },

    /**
     * Mark whitespaces and comments
     */
    markSC: function() {
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
        for (var i = 0; i < tokensLength; i++) {
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
    },

    /**
     * Pair brackets
     */
    markBrackets: function() {
        var ps = [], // parenthesis
            sbs = [], // square brackets
            cbs = [], // curly brackets
            t; // current token

        // For every token in the token list, if we meet an opening (left)
        // bracket, push its index number to a corresponding array.
        // If we then meet a closing (right) bracket, look at the corresponding
        // array. If there are any elements (records about previously met
        // left brackets), take a token of the last left bracket (take
        // the last index number from the array and find a token with
        // this index number) and save right bracket's index as a reference:
        for (var i = 0; i < tokens.length; i++) {
            t = tokens[i];
            switch(t.type) {
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
    },

    /**
     * Parse a multiline comment
     * @param {string} css Unparsed part of CSS string
     */
    parseMLComment: function(css) {
        var start = pos;

        // Read the string until we meet `*/`.
        // Since we already know first 2 characters (`/*`), start reading
        // from `pos + 2`:
        for (pos = pos + 2; pos < css.length; pos++) {
            if (css.charAt(pos) === '*' && css.charAt(pos + 1) === '/') {
                pos++;
                break;
            }
        }

        // Add full comment (including `/*` and `*/`) to the list of tokens:
        pushToken(TokenType.CommentML, css.substring(start, pos + 1));
    },

    /**
     * Parse a single line comment
     * @param {string} css Unparsed part of CSS string
     */
    parseSLComment: function(css) {
        var start = pos;

        // Read the string until we meet line break.
        // Since we already know first 2 characters (`//`), start reading
        // from `pos + 2`:
        for (pos = pos + 2; pos < css.length; pos++) {
            if (css.charAt(pos) === '\n' || css.charAt(pos) === '\r') {
                break;
            }
        }

        // Add comment (including `//` and line break) to the list of tokens:
        pushToken(TokenType.CommentSL, css.substring(start, pos));
        pos--;
    }
};
