(function() {
    var less = Object.create(syntaxes.css);

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkAny = function(i) {
        return this.checkBraces(i) ||
            this.checkString(i) ||
            this.checkVariablesList(i) ||
            this.checkVariable(i) ||
            this.checkPercentage(i) ||
            this.checkDimension(i) ||
            this.checkNumber(i) ||
            this.checkUri(i) ||
            this.checkFunctionExpression(i) ||
            this.checkFunction(i) ||
            this.checkIdent(i) ||
            this.checkClass(i) ||
            this.checkUnary(i);
    };

    /**
     * @returns {Array}
     */
    less.getAny = function() {
        if (this.checkBraces(pos)) return this.getBraces();
        else if (this.checkString(pos)) return this.getString();
        else if (this.checkVariablesList(pos)) return this.getVariablesList();
        else if (this.checkVariable(pos)) return this.getVariable();
        else if (this.checkPercentage(pos)) return this.getPercentage();
        else if (this.checkDimension(pos)) return this.getDimension();
        else if (this.checkNumber(pos)) return this.getNumber();
        else if (this.checkUri(pos)) return this.getUri();
        else if (this.checkFunctionExpression(pos)) return this.getFunctionExpression();
        else if (this.checkFunction(pos)) return this.getFunction();
        else if (this.checkIdent(pos)) return this.getIdent();
        else if (this.checkClass(pos)) return this.getClass();
        else if (this.checkUnary(pos)) return this.getUnary();
    };

    /**
     * Check if token is part of mixin's arguments.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkArguments = function (i) {
        var start = i,
            l;

        if (i >= tokensLength ||
            tokens[i++].type !== TokenType.LeftParenthesis) return 0;

        while (i < tokens[start].right) {
            if (l = this.checkArgument(i)) i +=l;
            else return 0;
        }

        return tokens[start].right - start + 1;
    };

    /**
     * Check if token is valid to be part of arguments list.
     * @param i Token's index number
     * @returns {Number}
     */
    less.checkArgument = function(i) {
        return this.checkDeclaration(i) ||
            this.checkVariablesList(i) ||
            this.checkVariable(i) ||
            this.checkSC(i) ||
            this.checkUnary(i) ||
            this.checkOperator(i) ||
            this.checkDelim(i) ||
            this.checkDeclDelim(i) ||
            this.checkString(i) ||
            this.checkPercentage(i) ||
            this.checkDimension(i) ||
            this.checkNumber(i) ||
            this.checkUri(i) ||
            this.checkFunction(i) ||
            this.checkIdent(i) ||
            this.checkVhash(i);
    };

    /**
     * @returns {Array} Node that is part of arguments list.
     */
    less.getArgument = function() {
        if (this.checkDeclaration(pos)) return this.getDeclaration();
        if (this.checkVariablesList(pos)) return this.getVariablesList();
        if (this.checkVariable(pos)) return this.getVariable();
        if (this.checkSC(pos)) return this.getSC();
        if (this.checkUnary(pos)) return this.getUnary();
        if (this.checkOperator(pos)) return this.getOperator();
        if (this.checkDelim(pos)) return this.getDelim();
        if (this.checkDeclDelim(pos)) return this.getDeclDelim();
        if (this.checkString(pos)) return this.getString();
        if (this.checkPercentage(pos)) return this.getPercentage();
        if (this.checkDimension(pos)) return this.getDimension();
        if (this.checkNumber(pos)) return this.getNumber();
        if (this.checkUri(pos)) return this.getUri();
        if (this.checkFunction(pos)) return this.getFunction();
        if (this.checkIdent(pos)) return this.getIdent();
        if (this.checkVhash(pos)) return this.getVhash();
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkBlockdecl1 = function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkCondition(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkFilter(i)) tokens[i].bd_kind = 3;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 4;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 5;
        else if (l = this.checkRuleset(i)) tokens[i].bd_kind = 6;
        else if (l = this.checkInclude(i)) tokens[i].bd_kind = 2;
        else return 0;

        i += l;

        if (i < tokensLength && (l = this.checkDeclDelim(i))) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        return i - start;
    }

    /**
     * @returns {Array}
     */
    less.getBlockdecl1 = function() {
        var sc = this.getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = this.getCondition();
                break;
            case 2:
                x = this.getInclude();
                break;
            case 3:
                x = this.getFilter();
                break;
            case 4:
                x = this.getDeclaration();
                break;
            case 5:
                x = this.getAtrule();
                break;
            case 6:
                x = this.getRuleset();
                break;
        }

        return sc
            .concat([x])
            .concat([this.getDeclDelim()])
            .concat(this.getSC());
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkBlockdecl2 = function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkCondition(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkFilter(i)) tokens[i].bd_kind = 3;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 4;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 5;
        else if (l = this.checkRuleset(i)) tokens[i].bd_kind = 6;
        else if (l = this.checkInclude(i)) tokens[i].bd_kind = 2;
        else return 0;

        i += l;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    less.getBlockdecl2 = function() {
        var sc = this.getSC(),
            x;

        switch (tokens[pos].bd_kind) {
            case 1:
                x = this.getCondition();
                break;
            case 2:
                x = this.getInclude();
                break;
            case 3:
                x = this.getFilter();
                break;
            case 4:
                x = this.getDeclaration();
                break;
            case 5:
                x = this.getAtrule();
                break;
            case 6:
                x = this.getRuleset();
                break;
        }

        return sc
            .concat([x])
            .concat(this.getSC());
    };

    /**
     * Check if token is part of a class selector (e.g. `.abc`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the class selector
     */
    less.checkClass = function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (tokens[i].class_l) return tokens[i].class_l;

        if (tokens[i++].type === TokenType.FullStop &&
            (l = this.checkInterpolatedVariable(i) || this.checkIdent(i))) {
            tokens[i].class_l = l + 1;
            return l + 1;
        }

        return 0;
    };

    /**
     * Get node with a class selector
     * @returns {Array} `['class', ['ident', x]]` where x is a class's
     *      identifier (without `.`, e.g. `abc`).
     */
    less.getClass = function() {
        var startPos = pos,
            x = [NodeType.ClassType];

        pos++;

        x.push(this.checkInterpolatedVariable(pos) ? this.getInterpolatedVariable() : this.getIdent());

        return x;
    };

    /**
     * Check if token is part of a single-line comment.
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a single-line comment, otherwise `0`
     */
    less.checkCommentSL = function(i) {
        return i < tokensLength && tokens[i].type === TokenType.CommentSL ? 1 : 0;
    };

    /**
     * Get node with a single-line comment.
     * @returns {Array}
     */
    less.getCommentSL = function() {
        var startPos = pos,
            x;

        x = [NodeType.CommentSLType, tokens[pos++].value.substring(2)];

        return x;
    };

    /**
     * Check if token is part of a condition.
     * @param {Number} i Token's index number
     * @return {Number} Length of the condition
     */
    less.checkCondition = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if ((l = this.checkIdent(i)) && tokens[i].value === 'when') i += l;
        else return 0;

        while (i < tokensLength) {
            if (l = this.checkBlock(i)) break;
            if (l = this.checkFunction(i) |
                this.checkBraces(i) ||
                this.checkVariable(i) ||
                this.checkIdent(i) ||
                this.checkSC(i) ||
                this.checkNumber(i) ||
                this.checkDelim(i) ||
                this.checkOperator(i) ||
                this.checkCombinator(i) ||
                this.checkString(i)) i += l;
            else return 0;
        }

        return i - start;
    };

    /**
     * Get node with a condition.
     * @returns {Array} `['condition', x]`
     */
    less.getCondition = function() {
        var startPos = pos,
            x = [NodeType.ConditionType];

        x.push(this.getIdent());

        while (pos < tokensLength) {
            if (this.checkBlock(pos)) break;
            else if (this.checkFunction(pos)) x.push(this.getFunction());
            else if (this.checkBraces(pos)) x.push(this.getBraces());
            else if (this.checkVariable(pos)) x.push(this.getVariable());
            else if (this.checkIdent(pos)) x.push(this.getIdent());
            else if (this.checkNumber(pos)) x.push(this.getNumber());
            else if (this.checkDelim(pos)) x.push(this.getDelim());
            else if (this.checkOperator(pos)) x.push(this.getOperator());
            else if (this.checkCombinator(pos)) x.push(this.getCombinator());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkString(pos)) x.push(this.getString());
        }

        return x;
    };

    /**
     * Check if token is part of an escaped string (e.g. `~"ms:something"`).
     * @param {Number} i Token's index number
     * @returns {Numer} Length of the string (including `~` and quotes)
     */
    less.checkEscapedString = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (tokens[i].type === TokenType.Tilde && (l = this.checkString(i + 1))) return i + l - start;
        else return 0;
    };

    /**
     * Get node with an escaped string
     * @returns {Array} `['escapedString', ['string', x]]` where `x` is a string
     *      without `~` but with quotes
     */
    less.getEscapedString = function() {
       var startPos = pos,
            x = [NodeType.EscapedStringType];

        pos++;

        x.push(tokens[pos++].value);

        return x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkFilterv = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkProgid(i) || this.checkEscapedString(i)) i += l;
        else return 0;

        while (l = this.checkProgid(i) || this.checkEscapedString(i)) {
            i += l;
        }

        tokens[start].last_progid = i;

        if (i < tokensLength && (l = this.checkSC(i))) i += l;

        if (i < tokensLength && (l = this.checkImportant(i))) i += l;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    less.getFilterv = function() {
        var startPos = pos,
            x = [NodeType.FiltervType],
            last_progid = tokens[pos].last_progid;

        x = x.concat(this.getSC());

        while (pos < last_progid) {
            x.push(this.checkProgid(pos) ? this.getProgid() : this.getEscapedString());
        }

        if (this.checkSC(pos)) x = x.concat(this.getSC());

        if (pos < tokensLength && this.checkImportant(pos)) x.push(this.getImportant());

        return x;
    },



    /**
     * Check if token is part of an identifier
     * @param {Number} i Token's index number
     * @returns {Number} Length of the identifier
     */
    less.checkIdent = function(i) {
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
            if (l = this.checkInterpolatedVariable(i)) i += l;

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
    };

    /**
     * Check if token is part of an include (`@include` or `@extend` directive).
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkInclude = function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (l = this.checkInclude1(i)) tokens[i].include_type = 1;
        else if (l = this.checkInclude2(i)) tokens[i].include_type = 2;

        return l;
    };

    /**
     * Get node with included mixin
     * @returns {Array} `['include', x]`
     */
    less.getInclude = function() {
        switch (tokens[pos].include_type) {
            case 1: return this.getInclude1();
            case 2: return this.getInclude2();
        }
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkInclude1 = function(i) {
        var start = i,
            l;

        if (l = this.checkClass(i) || this.checkShash(i)) i += l;
        else return 0;

        while (i < tokensLength) {
            if (l = this.checkClass(i) || this.checkShash(i) || this.checkSC(i)) i += l;
            else if (tokens[i].type == TokenType.GreaterThanSign) i++;
            else break;
        }

        if (l = this.checkArguments(i)) i += l;
        else return 0;

        if (i < tokensLength && (l = this.checkSC(i))) i += l;

        if (i < tokensLength && (l = this.checkImportant(i))) i += l;

        return i - start;
    };

    /**
     * @returns {Array} `['include', x]`
     */
    less.getInclude1 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.checkClass(pos) ? this.getClass() : this.getShash());

        while (pos < tokensLength) {
            if (this.checkClass(pos)) x.push(this.getClass());
            else if (this.checkShash(pos)) x.push(this.getShash());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkOperator(pos)) x.push(this.getOperator());
            else break;
        }

        x.push(this.getArguments());

        x = x.concat(this.getSC());

        if (this.checkImportant(pos)) x.push(this.getImportant());

        return x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkInclude2 = function(i) {
        var start = i,
            l;

        if (l = this.checkClass(i) || this.checkShash(i)) i += l;
        else return 0;

        while (i < tokensLength) {
            if (l = this.checkClass(i) || this.checkShash(i) || this.checkSC(i)) i += l;
            else if (tokens[i].type == TokenType.GreaterThanSign) i++;
            else break;
        }

        return i - start;
    };

    /**
     * @returns {Array} `['include', x]`
     */
    less.getInclude2 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.checkClass(pos) ? this.getClass() : this.getShash());

        while (pos < tokensLength) {
            if (this.checkClass(pos)) x.push(this.getClass());
            else if (this.checkShash(pos)) x.push(this.getShash());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkOperator(pos)) x.push(this.getOperator());
            else break;
        }

        return x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkIncludeSelector = function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this.checkSimpleSelector2(i)) i += l;
            else break;
        }

        return i - start;
    };

    /**
     * @returns {Array}
     */
    less.getIncludeSelector = function() {
        var startPos = pos,
            x = [NodeType.SimpleselectorType],
            t;

        while (pos < tokensLength && this.checkSimpleSelector2(pos)) {
            t = this.getSimpleSelector2();

            if (typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return x;
    };

    /**
     * Check if token is part of LESS interpolated variable
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkInterpolatedVariable = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (tokens[i].type !== TokenType.CommercialAt ||
            !tokens[i + 1] || tokens[i + 1].type !== TokenType.LeftCurlyBracket) return 0;

        i += 2;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        return tokens[i].type === TokenType.RightCurlyBracket ? i - start + 1 : 0;
    };

    /**
     * Get node with LESS interpolated variable
     * @returns {Array} `['interpolatedVariable', x]`
     */
    less.getInterpolatedVariable = function() {
        var startPos = pos,
            x = [NodeType.InterpolatedVariableType];

        // Skip `@{`:
        pos += 2;

        x.push(this.getIdent());

        // Skip `}`:
        pos++;

        return x;
    };

    /**
     * Check if token is part of a LESS mixin
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    less.checkMixin = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkClass(i) || this.checkShash(i)) i +=l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkArguments(i)) i += l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else return 0;

        return i - start;
    };

    /**
     * Get node with a mixin
     * @returns {Array} `['mixin', x]`
     */
    less.getMixin = function() {
        var startPos = pos,
            x = [NodeType.MixinType];

        x.push(this.checkClass(pos) ? this.getClass() : this.getShash());

        x = x.concat(this.getSC());

        if (this.checkArguments(pos)) x.push(this.getArguments());

        x = x.concat(this.getSC());

        if (this.checkBlock(pos)) x.push(this.getBlock());

        return x;
    };

    /**
     * Check if token is an operator (`/`, `,`, `:`, `=`, `>`, `<` or `*`)
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is an operator, otherwise `0`
     */
    less.checkOperator = function(i) {
        if (i >= tokensLength) return 0;

        switch(tokens[i].type) {
            case TokenType.Solidus:
            case TokenType.Comma:
            case TokenType.Colon:
            case TokenType.EqualsSign:
            case TokenType.LessThanSign:
            case TokenType.GreaterThanSign:
            case TokenType.Asterisk:
                return 1;
        }

        return 0;
    };

    /**
     * Check if token is a parent selector (`&`).
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkParentSelector = function(i) {
        return i < tokensLength && tokens[i].type === TokenType.Ampersand ? 1 : 0;
    };

    /**
     * Get node with a parent selector
     * @returns {Array} `['parentSelector']`
     */
    less.getParentSelector = function() {
        var startPos = pos,
            x = [NodeType.ParentSelectorType, '&'];

        pos++;

        return x;
    };

    /**
     * Check if token is part of a property
     * @param {Number} i Token's index number
     * @returns {Number} Length of the property
     */
    less.checkProperty = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkVariable(i) || this.checkIdent(i)) i += l;
        else return 0;

        return i - start;
    };

    /**
     * Get node with a property
     * @returns {Array} `['property', x]`
     */
    less.getProperty = function() {
        var startPos = pos,
            x = [NodeType.PropertyType];

        if (this.checkVariable(pos)) x.push(this.getVariable());
        else x.push(this.getIdent());

        return x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkPseudoe = function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon ||
            i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkInterpolatedVariable(i) || this.checkIdent(i)) ? l + 2 : 0;
    };

    /**
     * @returns {Array}
     */
    less.getPseudoe = function() {
        var startPos = pos,
            x = [NodeType.PseudoeType];

        pos += 2;

        x.push(this.checkInterpolatedVariable(pos) ? this.getInterpolatedVariable() : this.getIdent());

        return x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkPseudoc = function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkInterpolatedVariable(i) || this.checkFunction(i) || this.checkIdent(i)) ? l + 1 : 0;
    };

    /**
     * @returns {Array}
     */
    less.getPseudoc = function() {
        var startPos = pos,
            x = [NodeType.PseudocType];

        pos ++;

        if (this.checkInterpolatedVariable(pos)) x.push(this.getInterpolatedVariable());
        else if (this.checkFunction(pos)) x.push(this.getFunction());
        else x.push(this.getIdent());

        return x;
    };

    /**
     * Check if token is a space or a comment.
     * @param {Number} i Token's index number
     * @returns {Number} Number of similar (space or comment) tokens
     *      in a row starting with the given token.
     */
    less.checkSC = function(i) {
        if (i >= tokensLength) return 0;

        var l,
            lsc = 0,
            ln = tokens[i].ln;

        while (i < tokensLength) {
            if (!(l = this.checkS(i)) &&
                !(l = this.checkCommentML(i)) &&
                !(l = this.checkCommentSL(i))) break;
            i += l;
            lsc += l;
        }

        return lsc || 0;
    };

    /**
     * Get node with spaces and comments
     * @returns {Array} Array containing nodes with spaces (if there are any)
     *      and nodes with comments (if there are any):
     *      `[['s', x]*, ['comment', y]*]` where `x` is a string of spaces
     *      and `y` is a comment's text (without `/*` and `* /`).
     */
    less.getSC = function() {
        var sc = [],
            ln;

        if (pos >= tokensLength) return sc;

        ln = tokens[pos].ln;

        while (pos < tokensLength) {
            if (this.checkS(pos)) sc.push(this.getS());
            else if (this.checkCommentML(pos)) sc.push(this.getCommentML());
            else if (this.checkCommentSL(pos)) sc.push(this.getCommentSL());
            else break;
        }

        return sc;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkSimpleSelector1 = function(i) {
        return this.checkParentSelector(i) ||
            this.checkNthselector(i) ||
            this.checkCombinator(i) ||
            this.checkAttrib(i) ||
            this.checkPseudo(i) ||
            this.checkShash(i) ||
            this.checkAny(i) ||
            this.checkSC(i) ||
            this.checkNamespace(i);
    };

    /**
     * @returns {Array}
     */
    less.getSimpleSelector1 = function() {
        if (this.checkParentSelector(pos)) return this.getParentSelector();
        else if (this.checkNthselector(pos)) return this.getNthselector();
        else if (this.checkCombinator(pos)) return this.getCombinator();
        else if (this.checkAttrib(pos)) return this.getAttrib();
        else if (this.checkPseudo(pos)) return this.getPseudo();
        else if (this.checkShash(pos)) return this.getShash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkSC(pos)) return this.getSC();
        else if (this.checkNamespace(pos)) return this.getNamespace();
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkSimpleSelector2 = function(i) {
        return this.checkParentSelector(i) ||
            this.checkNthselector(i) ||
            this.checkAttrib(i) ||
            this.checkPseudo(i) ||
            this.checkShash(i) ||
            this.checkIdent(i) ||
            this.checkClass(i);
    };

    /**
     * @returns {Array}
     */
    less.getSimpleSelector2 = function() {
        if (this.checkParentSelector(pos)) return this.getParentSelector();
        else if (this.checkNthselector(pos)) return this.getNthselector();
        else if (this.checkAttrib(pos)) return this.getAttrib();
        else if (this.checkPseudo(pos)) return this.getPseudo();
        else if (this.checkShash(pos)) return this.getShash();
        else if (this.checkIdent(pos)) return this.getIdent();
        else if (this.checkClass(pos)) return this.getClass();
    };

    /**
     * Validate stylesheet: it should consist of any number (0 or more) of
     * rulesets (sets of rules with selectors), @-rules, whitespaces or
     * comments.
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkStylesheet = function(i) {
        var start = i,
            l;

        // Check every token:
        while (i < tokensLength) {
            if (l = this.checkSC(i) ||
                this.checkDeclaration(i) ||
                this.checkDeclDelim(i) ||
                this.checkInclude(i) ||
                this.checkMixin(i) ||
                this.checkAtrule(i) ||
                this.checkRuleset(i)) i += l;
            else throwError(i);
        }

        return i - start;
    };

    /**
     * @returns {Array} `['stylesheet', x]` where `x` is all stylesheet's
     *      nodes.
     */
    less.getStylesheet = function() {
        var startPos = pos,
            x = [NodeType.StylesheetType];

        while (pos < tokensLength) {
            if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkAtrule(pos)) x.push(this.getAtrule());
            else if (this.checkRuleset(pos)) x.push(this.getRuleset());
            else if (this.checkInclude(pos)) x.push(this.getInclude());
            else if (this.checkMixin(pos)) x.push(this.getMixin());
            else if (this.checkDeclaration(pos)) x.push(this.getDeclaration());
            else if (this.checkDeclDelim(pos)) x.push(this.getDeclDelim());
            else throwError();
        }

        return x;
    };

    /**
     * Check if token is part of a value
     * @param {Number} i Token's index number
     * @returns {Number} Length of the value
     */
    less.checkValue = function(i) {
        var start = i,
            l, s, _i;

        while (i < tokensLength) {
            s = this.checkSC(i);
            _i = i + s;

            if (l = this._checkValue(_i)) i += l + s;
            if (!l || this.checkBlock(_i)) break;
        }

        return i - start;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less._checkValue = function(i) {
        return this.checkEscapedString(i) ||
            this.checkInterpolatedVariable(i) ||
            this.checkVariable(i) ||
            this.checkVhash(i) ||
            this.checkBlock(i) ||
            this.checkAny(i) ||
            this.checkAtkeyword(i) ||
            this.checkOperator(i) ||
            this.checkImportant(i);
    };

    /**
     * @returns {Array}
     */
    less.getValue = function() {
        var startPos = pos,
            x = [NodeType.ValueType],
            s, _pos;

        while (pos < tokensLength) {
            s = this.checkSC(pos);
            _pos = pos + s;

            if (!this._checkValue(_pos)) break;

            if (s) x = x.concat(this.getSC());
            x.push(this._getValue());
        }

        return x;
    };

    /**
     * @returns {Array}
     */
    less._getValue = function() {
        if (this.checkEscapedString(pos)) return this.getEscapedString();
        else if (this.checkInterpolatedVariable(pos)) return this.getInterpolatedVariable();
        else if (this.checkVariable(pos)) return this.getVariable();
        else if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkBlock(pos)) return this.getBlock();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkAtkeyword(pos)) return this.getAtkeyword();
        else if (this.checkOperator(pos)) return this.getOperator();
        else if (this.checkImportant(pos)) return this.getImportant();
    };

    /**
     * Check if token is part of LESS variable
     * @param {Number} i Token's index number
     * @returns {Number} Length of the variable
     */
    less.checkVariable = function(i) {
        var l;

        if (i >= tokensLength || tokens[i].type !== TokenType.CommercialAt) return 0;

        if (tokens[i - 1] &&
            tokens[i - 1].type === TokenType.CommercialAt &&
            tokens[i - 2] &&
            tokens[i - 2].type === TokenType.CommercialAt) return 0;

        return (l = this.checkVariable(i + 1) || this.checkIdent(i + 1)) ? l + 1 : 0;
    };

    /**
     * Get node with a variable
     * @returns {Array} `['variable', ['ident', x]]` where `x` is
     *      a variable name.
     */
    less.getVariable = function() {
        var startPos = pos,
            x = [NodeType.VariableType];

        pos++;

        if (this.checkVariable(pos)) x.push(this.getVariable());
        else x.push(this.getIdent());

        return x;
    };


    /**
     * Check if token is part of a variables list (e.g. `@rest...`).
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    less.checkVariablesList = function(i) {
        var d = 0, // number of dots
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkVariable(i)) i+= l;
        else return 0;

        while (tokens[i] && tokens[i].type === TokenType.FullStop) {
            d++;
            i++;
        }

        return d === 3 ? l + d : 0;
    };

    /**
     * Get node with a variables list
     * @returns {Array} `['variableslist', ['variable', ['ident', x]]]` where
     *      `x` is a variable name.
     */
    less.getVariablesList = function() {
        var startPos = pos,
            x = [NodeType.VariablesListType, this.getVariable()];

        pos += 3;

        return x;
    };

    /**
     * Mark whitespaces and comments
     */
    less.markSC = function() {
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
    };

    syntaxes.less = less;
})();
