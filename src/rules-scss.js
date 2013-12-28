(function() {
    var scss = Object.create(syntaxes.css);

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkAny = function(i) {
        return this.checkBraces(i) ||
            this.checkString(i) ||
            this.checkVariablesList(i) ||
            this.checkVariable(i) ||
            this.checkPlaceholder(i) ||
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
    scss.getAny = function() {
        if (this.checkBraces(pos)) return this.getBraces();
        else if (this.checkString(pos)) return this.getString();
        else if (this.checkVariablesList(pos)) return this.getVariablesList();
        else if (this.checkVariable(pos)) return this.getVariable();
        else if (this.checkPlaceholder(pos)) return this.getPlaceholder();
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
     * @returns {Number} Length of arguments
     */
    scss.checkArguments = function (i) {
        var start = i,
            l;

        if (i >= tokensLength ||
            tokens[i].type !== TokenType.LeftParenthesis) return 0;

        i++;

        while (i < tokens[start].right) {
            if (l = this.checkArgument(i)) i +=l;
            else return 0;
        }

        return tokens[start].right - start + 1;
    };

    /**
     * Get node with mixin's arguments
     * @returns {Array} `['arguments', x]`
     */
    scss.getArguments = function() {
        var startPos = pos,
            arguments = [],
            x;

        pos++;

        while (x = this.getArgument()) {
            if ((needInfo && typeof x[1] === 'string') || typeof x[0] === 'string') arguments.push(x);
            else arguments = arguments.concat(x);
        }

        pos++;

        x = [NodeType.ArgumentsType].concat(arguments);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is valid to be part of arguments list
     * @param i Token's index number
     * @returns {Number} Length of argument
     */
    scss.checkArgument = function(i) {
        return this.checkDeclaration(i) ||
            this.checkVariablesList(i) ||
            this.checkVariable(i) ||
            this.checkSC(i) ||
            this.checkDelim(i) ||
            this.checkDeclDelim(i) ||
            this.checkString(i) ||
            this.checkPercentage(i) ||
            this.checkDimension(i) ||
            this.checkNumber(i) ||
            this.checkUri(i) ||
            this.checkIdent(i) ||
            this.checkVhash(i);
    };

    /**
     * @returns {Array} Node that is part of arguments list
     */
    scss.getArgument = function() {
        if (this.checkDeclaration(pos)) return this.getDeclaration();
        else if (this.checkVariablesList(pos)) return this.getVariablesList();
        else if (this.checkVariable(pos)) return this.getVariable();
        else if (this.checkSC(pos)) return this.getSC();
        else if (this.checkDelim(pos)) return this.getDelim();
        else if (this.checkDeclDelim(pos)) return this.getDeclDelim();
        else if (this.checkString(pos)) return this.getString();
        else if (this.checkPercentage(pos)) return this.getPercentage();
        else if (this.checkDimension(pos)) return this.getDimension();
        else if (this.checkNumber(pos)) return this.getNumber();
        else if (this.checkUri(pos)) return this.getUri();
        else if (this.checkIdent(pos)) return this.getIdent();
        else if (this.checkVhash(pos)) return this.getVhash();
    };

    /**
     * Check if token is part of a declaration (property-value pair,
     *      loop, mixin, etc.), followed by a declaration delimiter ';' and
     *      mixed with optional whitespaces.
     * @param {Number} i Token's index number
     * @returns {Number} Length of declaration
     */
    scss.checkBlockdecl1 = function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkCondition(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkInclude(i)) tokens[i].bd_kind = 2;
        else if (l = this.checkLoop(i)) tokens[i].bd_kind = 3;
        else if (l = this.checkFilter(i)) tokens[i].bd_kind = 4;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 5;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 6;
        else if (l = this.checkRuleset(i)) tokens[i].bd_kind = 7;
        else return 0;

        i += l;

        if (i < tokensLength && (l = this.checkDeclDelim(i))) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    scss.getBlockdecl1 = function() {
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
                x = this.getLoop();
                break;
            case 4:
                x = this.getFilter();
                break;
            case 5:
                x = this.getDeclaration();
                break;
            case 6:
                x = this.getAtrule();
                break;
            case 7:
                x = this.getRuleset();
                break;
        }

        return sc
            .concat([x])
            .concat([this.getDeclDelim()])
            .concat(this.getSC());
    };

    /**
     * Check if token is part of a declaration not followed by declaration
     *      delimiter but mixed with optional whitespaces.
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    scss.checkBlockdecl2 = function(i) {
        var start = i,
            l;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkCondition(i)) tokens[i].bd_kind = 1;
        else if (l = this.checkInclude(i)) tokens[i].bd_kind = 2;
        else if (l = this.checkLoop(i)) tokens[i].bd_kind = 3;
        else if (l = this.checkFilter(i)) tokens[i].bd_kind = 4;
        else if (l = this.checkDeclaration(i)) tokens[i].bd_kind = 5;
        else if (l = this.checkAtrule(i)) tokens[i].bd_kind = 6;
        else if (l = this.checkRuleset(i)) tokens[i].bd_kind = 7;
        else return 0;

        i += l;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    scss.getBlockdecl2 = function() {
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
                x = this.getLoop();
                break;
            case 4:
                x = this.getFilter();
                break;
            case 5:
                x = this.getDeclaration();
                break;
            case 6:
                x = this.getAtrule();
                break;
            case 7:
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
    scss.checkClass = function(i) {
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
    scss.getClass = function() {
        var startPos = pos,
            x = [NodeType.ClassType];

        pos++;

        x.push(this.checkInterpolatedVariable(pos) ? this.getInterpolatedVariable() : this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a single-line comment.
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a single-line comment, otherwise `0`
     */
    scss.checkCommentSL = function(i) {
        return i < tokensLength && tokens[i].type === TokenType.CommentSL ? 1 : 0;
    };

    /**
     * Get node with a single-line comment.
     * @returns {Array} `['commentSL', x]` where `x` is comment's message
     *      (without `//`)
     */
    scss.getCommentSL = function() {
        var startPos = pos,
            x;

        x = [NodeType.CommentSLType, tokens[pos++].value.substring(2)];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a condition
     * (e.g. `@if ... @else if ... @else ...`).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the condition
     */
    scss.checkCondition = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (['if', 'else'].indexOf(tokens[start + 1].value) < 0) return 0;

        while (i < tokensLength) {
            if (l = this.checkBlock(i)) break;
            else if (l = this.checkVariable(i) ||
                     this.checkIdent(i) ||
                     this.checkSC(i) ||
                     this.checkNumber(i) ||
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
    scss.getCondition = function() {
        var startPos = pos,
            x = [NodeType.ConditionType];

        x.push(this.getAtkeyword());

        while (pos < tokensLength) {
            if (this.checkBlock(pos)) break;
            else if (this.checkVariable(pos)) x.push(this.getVariable());
            else if (this.checkIdent(pos)) x.push(this.getIdent());
            else if (this.checkNumber(pos)) x.push(this.getNumber());
            else if (this.checkOperator(pos)) x.push(this.getOperator());
            else if (this.checkCombinator(pos)) x.push(this.getCombinator());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkString(pos)) x.push(this.getString());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token if part of `!default` word.
     * @param {Number} i Token's index number
     * @returns {Number} Length of the `!default` word
     */
    scss.checkDefault = function(i) {
        var start = i,
            l;

        if (i >= tokensLength ||
            tokens[i++].type !== TokenType.ExclamationMark) return 0;

        if (l = this.checkSC(i)) i += l;

        return tokens[i].value === 'default' ? i - start + 1 : 0;
    };

    /**
     * Get node with a `!default` word
     * @returns {Array} `['default', sc]` where `sc` is optional whitespace
     */
    scss.getDefault = function() {
        var startPos = pos,
            x = [NodeType.DefaultType],
            sc;

        // Skip `!`:
        pos++;

        sc = this.getSC();

        // Skip `default`:
        pos++;

        x = x.concat(sc);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an identifier
     * @param {Number} i Token's index number
     * @returns {Number} Length of the identifier
     */
    scss.checkIdent = function(i) {
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
     * Check if token is part of an included mixin (`@include` or `@extend`
     *      directive).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the included mixin
     */
    scss.checkInclude = function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (l = this.checkInclude1(i)) tokens[i].include_type = 1;
        else if (l = this.checkInclude2(i)) tokens[i].include_type = 2;
        else if (l = this.checkInclude3(i)) tokens[i].include_type = 3;
        else if (l = this.checkInclude4(i)) tokens[i].include_type = 4;

        return l;
    };

    /**
     * Get node with included mixin
     * @returns {Array} `['include', x]`
     */
    scss.getInclude = function() {
        switch (tokens[pos].include_type) {
            case 1: return this.getInclude1();
            case 2: return this.getInclude2();
            case 3: return this.getInclude3();
            case 4: return this.getInclude4();
        }
    };

    /**
     * Check if token is part of an included mixin like `@include nani(foo) {...}`
     * @param {Number} i Token's index number
     * @returns {Number} Length of the include
     */
    scss.checkInclude1 = function(i) {
        var start = i,
        l;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        // TODO: Check if extends don't take any arguments
        if (['include', 'extend'].indexOf(tokens[start + 1].value) < 0) return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        if (l = this.checkIncludeSelector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkArguments(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * Get node with included mixin like `@include nani(foo) {...}`
     * @returns {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
     *      ['arguments', z], sc, ['block', q], sc` where `x` is `include` or
     *      `extend`, `y` is mixin's identifier (selector), `z` are arguments
     *      passed to the mixin, `q` is block passed to the mixin and `sc`
     *      are optional whitespaces
     */
    scss.getInclude1 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getAtkeyword());

        x = x.concat(this.getSC());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        x.push(this.getArguments());

        x = x.concat(this.getSC());

        x.push(this.getBlock());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an included mixin like `@include nani(foo)`
     * @param {Number} i Token's index number
     * @returns {Number} Length of the include
     */
    scss.checkInclude2 = function(i) {
        var start = i,
        l;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        // TODO: Check if extends don't take any arguments
        if (['include', 'extend'].indexOf(tokens[start + 1].value) < 0) return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        if (l = this.checkIncludeSelector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkArguments(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * Get node with included mixin like `@include nani(foo)`
     * @returns {Array} `['include', ['atkeyword', x], sc, ['selector', y], sc,
     *      ['arguments', z], sc]` where `x` is `include` or `extend`, `y` is
     *      mixin's identifier (selector), `z` are arguments passed to the
     *      mixin and `sc` are optional whitespaces
     */
    scss.getInclude2 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getAtkeyword());

        x = x.concat(this.getSC());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        x.push(this.getArguments());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an included mixin with a content block passed
     *      as an argument (e.g. `@include nani {...}`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    scss.checkInclude3 = function(i) {
        var start = i,
            l;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (['include', 'extend'].indexOf(tokens[start + 1].value) < 0) return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        if (l = this.checkIncludeSelector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * Get node with an included mixin with a content block passed
     *      as an argument (e.g. `@include nani {...}`)
     * @returns {Array} `['include', x]`
     */
    scss.getInclude3 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getAtkeyword());

        x = x.concat(this.getSC());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        x.push(this.getBlock());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkInclude4 = function(i) {
        var start = i,
            l;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (['include', 'extend'].indexOf(tokens[start + 1].value) < 0) return 0;

        if (l = this.checkSC(i)) i += l;
        else return 0;

        if (l = this.checkIncludeSelector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * @returns {Array} `['include', x]`
     */
    scss.getInclude4 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getAtkeyword());

        x = x.concat(this.getSC());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkIncludeSelector = function(i) {
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
    scss.getIncludeSelector = function() {
        var startPos = pos,
            x = [NodeType.SimpleselectorType],
            t;

        while (pos < tokensLength && this.checkSimpleSelector2(pos)) {
            t = this.getSimpleSelector2();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an interpolated variable (e.g. `#{$nani}`).
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkInterpolatedVariable = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (tokens[i].type !== TokenType.NumberSign ||
            !tokens[i + 1] || tokens[i + 1].type !== TokenType.LeftCurlyBracket ||
            !tokens[i + 2] || tokens[i + 2].type !== TokenType.DollarSign) return 0;

        i += 3;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        return tokens[i].type === TokenType.RightCurlyBracket ? i - start + 1 : 0;
    };

    /**
     * Get node with an interpolated variable
     * @returns {Array} `['interpolatedVariable', x]`
     */
    scss.getInterpolatedVariable = function() {
        var startPos = pos,
            x = [NodeType.InterpolatedVariableType];

        // Skip `#{$`:
        pos += 3;

        x.push(this.getIdent());

        // Skip `}`:
        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a loop.
     * @param {Number} i Token's index number
     * @returns {Number} Length of the loop
     */
    scss.checkLoop = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkAtkeyword(i)) i += l;
        else return 0;

        if (['for', 'each', 'while'].indexOf(tokens[start + 1].value) < 0) return 0;

        while (i < tokensLength) {
            if (l = this.checkBlock(i)) {
                i += l;
                break;
            } else if (l = this.checkVariable(i) ||
                       this.checkIdent(i) ||
                       this.checkSC(i) ||
                       this.checkNumber(i) ||
                       this.checkOperator(i) ||
                       this.checkCombinator(i) ||
                       this.checkString(i)) i += l;
            else return 0;
        }

        return i - start;
    };

    /**
     * Get node with a loop.
     * @returns {Array} `['loop', x]`
     */
    scss.getLoop = function() {
        var startPos = pos,
            x = [NodeType.LoopType];

        x.push(this.getAtkeyword());

        while (pos < tokensLength) {
            if (this.checkBlock(pos)) {
                x.push(this.getBlock());
                break;
            }
            else if (this.checkVariable(pos)) x.push(this.getVariable());
            else if (this.checkIdent(pos)) x.push(this.getIdent());
            else if (this.checkNumber(pos)) x.push(this.getNumber());
            else if (this.checkOperator(pos)) x.push(this.getOperator());
            else if (this.checkCombinator(pos)) x.push(this.getCombinator());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkString(pos)) x.push(this.getString());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a mixin
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    scss.checkMixin = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if ((l = this.checkAtkeyword(i)) && tokens[i + 1].value === 'mixin') i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i)) i += l;
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
    scss.getMixin = function() {
        var startPos = pos,
            x = [NodeType.MixinType, this.getAtkeyword()];

        x = x.concat(this.getSC());

        if (this.checkIdent(pos)) x.push(this.getIdent());

        x = x.concat(this.getSC());

        if (this.checkArguments(pos)) x.push(this.getArguments());

        x = x.concat(this.getSC());

        if (this.checkBlock(pos)) x.push(this.getBlock());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is an operator (`/`, `,`, `:`, `=`, `>`, `<` or `*`)
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is an operator, `0` if not
     */
    scss.checkOperator = function(i) {
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
    scss.checkParentSelector = function(i) {
        return i < tokensLength && tokens[i].type === TokenType.Ampersand ? 1 : 0;
    };

    /**
     * Get node with a parent selector
     * @returns {Array} `['parentSelector']`
     */
    scss.getParentSelector = function() {
        var startPos = pos,
            x = [NodeType.ParentSelectorType, '&'];

        pos++;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a placeholder selector (e.g. `%abc`).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the selector
     */
    scss.checkPlaceholder = function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (tokens[i].placeholder_l) return tokens[i].placeholder_l;

        if (tokens[i].type === TokenType.PercentSign && (l = this.checkIdent(i + 1))) {
            tokens[i].placeholder_l = l + 1;
            return l + 1;
        } else return 0;
    };

    /**
     * Get node with a placeholder selector
     * @returns {Array} `['placeholder', ['ident', x]]` where x is a placeholder's
     *      identifier (without `%`, e.g. `abc`).
     */
    scss.getPlaceholder = function() {
        var startPos = pos,
            x = [NodeType.PlaceholderType];

        pos++;

        x.push(this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a property
     * @param {Number} i Token's index number
     * @returns {Number} Length of the property
     */
    scss.checkProperty = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkVariable(i) || this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * Get node with a property
     * @returns {Array} `['property', x]`
     */
    scss.getProperty = function() {
        var startPos = pos,
            x = [NodeType.PropertyType];

        x.push(this.checkVariable(pos) ? this.getVariable() : this.getIdent());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkPseudoe = function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon ||
            i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkInterpolatedVariable(i) || this.checkIdent(i)) ? l + 2 : 0;
    };

    /**
     * @returns {Array}
     */
    scss.getPseudoe = function() {
        var startPos = pos,
            x = [NodeType.PseudoeType];

        pos += 2;

        x.push(this.checkInterpolatedVariable(pos) ? this.getInterpolatedVariable() : this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkPseudoc = function(i) {
        var l;

        if (i >= tokensLength || tokens[i++].type !== TokenType.Colon) return 0;

        return (l = this.checkInterpolatedVariable(i) || this.checkFunction(i) || this.checkIdent(i)) ? l + 1 : 0;
    };

    /**
     * @returns {Array}
     */
    scss.getPseudoc = function() {
        var startPos = pos,
            x = [NodeType.PseudocType];

        pos ++;

        if (this.checkInterpolatedVariable(pos)) x.push(this.getInterpolatedVariable());
        else if (this.checkFunction(pos)) x.push(this.getFunction());
        else x.push(this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is a space or a comment.
     * @param {Number} i Token's index number
     * @returns {Number} Number of similar (space or comment) tokens
     *      in a row starting with the given token.
     */
    scss.checkSC = function(i) {
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
    scss.getSC = function() {
        var sc = [];

        if (pos >= tokensLength) return sc;

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
    scss.checkSimpleSelector1 = function(i) {
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
    scss.getSimpleSelector1 = function() {
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
    scss.checkSimpleSelector2 = function(i) {
        return this.checkParentSelector(i) ||
            this.checkNthselector(i) ||
            this.checkAttrib(i) ||
            this.checkPseudo(i) ||
            this.checkShash(i) ||
            this.checkPlaceholder(i) ||
            this.checkIdent(i) ||
            this.checkClass(i);
    };

    /**
     * @returns {Array}
     */
    scss.getSimpleSelector2 = function() {
        if (this.checkParentSelector(pos)) return this.getParentSelector();
        else if (this.checkNthselector(pos)) return this.getNthselector();
        else if (this.checkAttrib(pos)) return this.getAttrib();
        else if (this.checkPseudo(pos)) return this.getPseudo();
        else if (this.checkShash(pos)) return this.getShash();
        else if (this.checkPlaceholder(pos)) return this.getPlaceholder();
        else if (this.checkIdent(pos)) return this.getIdent();
        else if (this.checkClass(pos)) return this.getClass();
    };

    /**
     * Validate stylesheet: it should consist of any number (0 or more) of
     * rulesets (sets of rules with selectors), @-rules, whitespaces or
     * comments.
     * @param {Number} i Token's index number
     * @returns {Number} Length of the stylesheet
     */
    scss.checkStylesheet = function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this.checkSC(i) ||
                this.checkDeclaration(i) ||
                this.checkDeclDelim(i) ||
                this.checkInclude(i) ||
                this.checkMixin(i) ||
                this.checkLoop(i) ||
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
    scss.getStylesheet = function() {
        var startPos = pos,
            x = [NodeType.StylesheetType];

        while (pos < tokensLength) {
            if (this.checkSC(pos)) x = x.concat(this.getSC());
            else if (this.checkRuleset(pos)) x.push(this.getRuleset());
            else if (this.checkInclude(pos)) x.push(this.getInclude());
            else if (this.checkMixin(pos)) x.push(this.getMixin());
            else if (this.checkLoop(pos)) x.push(this.getLoop());
            else if (this.checkAtrule(pos)) x.push(this.getAtrule());
            else if (this.checkDeclaration(pos)) x.push(this.getDeclaration());
            else if (this.checkDeclDelim(pos)) x.push(this.getDeclDelim());
            else throwError();
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a value
     * @param {Number} i Token's index number
     * @returns {Number} Length of the value
     */
    scss.checkValue = function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (l = this._checkValue(i)) i += l;
            if (!l || this.checkBlock(i - l)) break;
        }

        return i - start;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss._checkValue = function(i) {
        return this.checkSC(i) ||
            this.checkInterpolatedVariable(i) ||
            this.checkVariable(i) ||
            this.checkVhash(i) ||
            this.checkBlock(i) ||
            this.checkAny(i) ||
            this.checkAtkeyword(i) ||
            this.checkOperator(i) ||
            this.checkImportant(i) ||
            this.checkDefault(i);
    };

    /**
     * @returns {Array}
     */
    scss.getValue = function() {
        var startPos = pos,
            x = [NodeType.ValueType],
            t, _pos;

        while (pos < tokensLength) {
            _pos = pos;

            if (!this._checkValue(pos)) break;
            t = this._getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);

            if (this.checkBlock(_pos)) break;
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @returns {Array}
     */
    scss._getValue = function() {
        if (this.checkSC(pos)) return this.getSC();
        else if (this.checkInterpolatedVariable(pos)) return this.getInterpolatedVariable();
        else if (this.checkVariable(pos)) return this.getVariable();
        else if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkBlock(pos)) return this.getBlock();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkAtkeyword(pos)) return this.getAtkeyword();
        else if (this.checkOperator(pos)) return this.getOperator();
        else if (this.checkImportant(pos)) return this.getImportant();
        else if (this.checkDefault(pos)) return this.getDefault();
    };

    /**
     * Check if token is part of a variable
     * @param {Number} i Token's index number
     * @returns {Number} Length of the variable
     */
    scss.checkVariable = function(i) {
        var l;

        if (i >= tokensLength || tokens[i].type !== TokenType.DollarSign) return 0;

        return (l = this.checkIdent(i + 1)) ? l + 1 : 0;
    };

    /**
     * Get node with a variable
     * @returns {Array} `['variable', ['ident', x]]` where `x` is
     *      a variable name.
     */
    scss.getVariable = function() {
        var startPos = pos,
            x = [NodeType.VariableType];

        pos++;

        x.push(this.getIdent());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };


    /**
     * Check if token is part of a variables list (e.g. `$values...`).
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    scss.checkVariablesList = function(i) {
        var d = 0, // number of dots
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkVariable(i)) i+= l;
        else return 0;

        while (i < tokensLength && tokens[i].type === TokenType.FullStop) {
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
    scss.getVariablesList = function() {
        var startPos = pos,
            x = [NodeType.VariablesListType, this.getVariable()];

        pos += 3;

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Mark whitespaces and comments
     */
    scss.markSC = function() {
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

    syntaxes.scss = scss;
})();
