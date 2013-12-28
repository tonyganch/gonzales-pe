(function() {
    var sass = Object.create(syntaxes.scss);

    /**
     * Check if token is part of a block (e.g. `{...}`).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the block
     */
    sass.checkBlock = function(i) {
        return i < tokensLength && tokens[i].block_end ?
            tokens[i].block_end - i + 1 : 0;
    };

    /**
     * Get node with a block
     * @returns {Array} `['block', x]`
     */
    sass.getBlock = function() {
        var startPos = pos,
            end = tokens[pos].block_end,
            x = [NodeType.BlockType];

        while (pos < end) {
            if (this.checkBlockdecl(pos)) x = x.concat(this.getBlockdecl());
            else throwError();
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Get node with a multiline comment
     * @returns {Array} `['commentML', x]` where `x`
     *      is the comment's text (without `/*`).
     */
    sass.getCommentML = function() {
        var startPos = pos,
            s = tokens[pos].value.substring(2),
            l = s.length,
            x;

        pos++;

        x = [NodeType.CommentMLType, s];

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    sass.checkDeclaration = function(i) {
        return this.checkDeclaration1(i) || this.checkDeclaration2(i);
    };

    /** Get node with declaration (property-value pair)
     * @returns {Array} `['declaration', x, y, z]`
     */
    sass.getDeclaration = function() {
        return this.checkDeclaration1(pos) ? this.getDeclaration1() : this.getDeclaration2();
    };

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    sass.checkDeclaration1 = function(i) {
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
    };

    /**
     * Get node with a declaration
     * @returns {Array} `['declaration', ['property', x], ['propertyDelim'],
     *       ['value', y]]`
     */
    sass.getDeclaration1 = function() {
        var startPos = pos,
        x = [NodeType.DeclarationType];

        x.push(this.getProperty());
        x.push(this.getPropertyDelim());
        x.push(this.getValue());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a declaration (property-value pair)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the declaration
     */
    sass.checkDeclaration2 = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkPropertyDelim(i)) i++;
        else return 0;

        if (l = this.checkProperty(i)) i += l;
        else return 0;

        if (l = this.checkValue(i)) i += l;
        else return 0;

        return i - start;
    };

    /**
     * Get node with a declaration
     * @returns {Array} `['declaration', ['propertyDelim'], ['property', x],
     *       ['value', y]]`
     */
    sass.getDeclaration2 = function() {
        var startPos = pos,
            x = [NodeType.DeclarationType];

        x.push(this.getPropertyDelim());
        x.push(this.getProperty());
        x.push(this.getValue());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is a semicolon
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a semicolon, otherwise `0`
     */
    sass.checkDeclDelim = function(i) {
        if (i >= tokensLength) return 0;

        return (tokens[i].type === TokenType.Newline ||
            tokens[i].type === TokenType.Semicolon) ? 1 : 0;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    sass.checkFilterv = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if (l = this.checkProgid(i)) i += l;
        else return 0;

        while (l = this.checkProgid(i)) {
            i += l;
        }

        tokens[start].last_progid = i;

        if (this.checkDeclDelim(i)) return i - start;

        if (i < tokensLength && (l = this.checkSC(i))) i += l;

        if (i < tokensLength && (l = this.checkImportant(i))) i += l;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    sass.getFilterv = function() {
        var startPos = pos,
            x = [NodeType.FiltervType],
            last_progid = tokens[pos].last_progid;

        while (pos < last_progid) {
            x.push(this.getProgid());
        }

        if (this.checkDeclDelim(pos)) return needInfo ? (x.unshift(getInfo(startPos)), x) : x;

        if (this.checkSC(pos)) x = x.concat(this.getSC());

        if (pos < tokensLength && this.checkImportant(pos)) x.push(this.getImportant());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an included mixin (`@include` or `@extend`
     *      directive).
     * @param {Number} i Token's index number
     * @returns {Number} Length of the included mixin
     */
    sass.checkInclude = function(i) {
        var l;

        if (i >= tokensLength) return 0;

        if (l = this.checkInclude1(i)) tokens[i].include_type = 1;
        else if (l = this.checkInclude2(i)) tokens[i].include_type = 2;
        else if (l = this.checkInclude3(i)) tokens[i].include_type = 3;
        else if (l = this.checkInclude4(i)) tokens[i].include_type = 4;
        else if (l = this.checkInclude5(i)) tokens[i].include_type = 5;
        else if (l = this.checkInclude6(i)) tokens[i].include_type = 6;
        else if (l = this.checkInclude7(i)) tokens[i].include_type = 7;
        else if (l = this.checkInclude8(i)) tokens[i].include_type = 8;

        return l;
    };

    /**
     * Get node with included mixin
     * @returns {Array} `['include', x]`
     */
    sass.getInclude = function() {
        switch (tokens[pos].include_type) {
            case 1: return this.getInclude1();
            case 2: return this.getInclude2();
            case 3: return this.getInclude3();
            case 4: return this.getInclude4();
            case 5: return this.getInclude5();
            case 6: return this.getInclude6();
            case 7: return this.getInclude7();
            case 8: return this.getInclude8();
        }
    };

    /**
     * Check if token is part of an included mixin like `+nani(foo) {...}`
     * @param {Number} i Token's index number
     * @returns {Number} Length of the include
     */
    sass.checkInclude5 = function(i) {
        var start = i,
        l;

        if (tokens[i].type === TokenType.PlusSign) i++;
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
     * Get node with included mixin like `+nani(foo) {...}`
     * @returns {Array} `['include', ['operator', '+'], ['selector', x], sc,
     *      ['arguments', y], sc, ['block', z], sc` where `x` is
     *      mixin's identifier (selector), `y` are arguments passed to the
     *      mixin, `z` is block passed to mixin and `sc` are optional whitespaces
     */
    sass.getInclude5 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getOperator());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        x.push(this.getArguments());

        x = x.concat(this.getSC());

        x.push(this.getBlock());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an included mixin like `+nani(foo)`
     * @param {Number} i Token's index number
     * @returns {Number} Length of the include
     */
    sass.checkInclude6 = function(i) {
        var start = i,
        l;

        if (tokens[i].type === TokenType.PlusSign) i++;
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
     * Get node with included mixin like `+nani(foo)`
     * @returns {Array} `['include', ['operator', '+'], ['selector', y], sc,
     *      ['arguments', z], sc]` where `y` is
     *      mixin's identifier (selector), `z` are arguments passed to the
     *      mixin and `sc` are optional whitespaces
     */
    sass.getInclude6 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getOperator());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        x.push(this.getArguments());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of an included mixin with a content block passed
     *      as an argument (e.g. `+nani {...}`)
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    sass.checkInclude7 = function(i) {
        var start = i,
            l;

        if (tokens[i].type === TokenType.PlusSign) i++;
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
     *      as an argument (e.g. `+nani {...}`)
     * @returns {Array} `['include', x]`
     */
    sass.getInclude7 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getOperator());

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
    sass.checkInclude8 = function(i) {
        var start = i,
            l;

        if (tokens[i].type === TokenType.PlusSign) i++;
        else return 0;

        if (l = this.checkIncludeSelector(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        return i - start;
    };

    /**
     * @returns {Array} `['include', x]`
     */
    sass.getInclude8 = function() {
        var startPos = pos,
            x = [NodeType.IncludeType];

        x.push(this.getOperator());

        x.push(this.getIncludeSelector());

        x = x.concat(this.getSC());

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a mixin
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    sass.checkMixin = function(i) {
        return this.checkMixin1(i) || this.checkMixin2(i);
    };

    /**
     * Gent node with mixin
     * @returns {Array} `['mixin', x]`
     */
    sass.getMixin = function() {
        return this.checkMixin1(pos) ? this.getMixin1() : this.getMixin2();
    };

    /**
     * Check if token is part of a mixin
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    sass.checkMixin1 = function(i) {
        var start = i,
            l;

        if (i >= tokensLength) return 0;

        if ((l = this.checkAtkeyword(i)) && tokens[i + 1].value === 'mixin') i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else {
            if (l = this.checkArguments(i)) i += l;

            if (l = this.checkSC(i)) i += l;

            if (l = this.checkBlock(i)) i += l;
            else return 0;
        }

        return i - start;
    };

    /**
     * Get node with a mixin
     * @returns {Array} `['mixin', x]`
     */
    sass.getMixin1 = function() {
        var startPos = pos,
            x = [NodeType.MixinType, this.getAtkeyword()];

        x = x.concat(this.getSC());

        if (this.checkIdent(pos)) x.push(this.getIdent());

        x = x.concat(this.getSC());

        if (this.checkBlock(pos)) x.push(this.getBlock());
        else {
            if (this.checkArguments(pos)) x.push(this.getArguments());

            x = x.concat(this.getSC());

            x.push(this.getBlock());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a mixin
     * @param {Number} i Token's index number
     * @returns {Number} Length of the mixin
     */
    sass.checkMixin2 = function(i) {
        var start = i,
        l;

        if (i >= tokensLength) return 0;

        if (tokens[i].type === TokenType.EqualsSign) i++;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkIdent(i)) i += l;
        else return 0;

        if (l = this.checkSC(i)) i += l;

        if (l = this.checkBlock(i)) i += l;
        else {
            if (l = this.checkArguments(i)) i += l;

            if (l = this.checkSC(i)) i += l;

            if (l = this.checkBlock(i)) i += l;
            else return 0;
        }

        return i - start;
    };

    /**
    * Get node with a mixin
    * @returns {Array} `['mixin', x]`
    */
    sass.getMixin2 = function() {
        var startPos = pos,
            x = [NodeType.MixinType, this.getOperator()];

        x = x.concat(this.getSC());

        if (this.checkIdent(pos)) x.push(this.getIdent());

        x = x.concat(this.getSC());

        if (this.checkBlock(pos)) x.push(this.getBlock());
        else {
            if (this.checkArguments(pos)) x.push(this.getArguments());

            x = x.concat(this.getSC());

            x.push(this.getBlock());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };


    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    sass.checkProgid = function(i) {
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

        return i - start;
    };

    /**
     * @returns {Array}
     */
    sass.getProgid = function() {
        var startPos = pos,
            progid_end = tokens[pos].progid_end,
            x;

        x = [NodeType.ProgidType]
            .concat(this.getSC())
            .concat([this._getProgid(progid_end)]);

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is a space or a comment.
     * @param {Number} i Token's index number
     * @returns {Number} Number of similar (space or comment) tokens
     *      in a row starting with the given token.
     */
    sass.checkSC = function(i) {
        if (!tokens[i]) return 0;

        var l,
            lsc = 0,
            ln = tokens[i].ln;

        while (i < tokensLength) {
            if (tokens[i].ln !== ln) break;

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
    sass.getSC = function() {
        var sc = [],
            ln;

        if (pos >= tokensLength) return sc;

        ln = tokens[pos].ln;

        while (pos < tokensLength) {
            if (tokens[pos].ln !== ln) break;
            else if (this.checkS(pos)) sc.push(this.getS());
            else if (this.checkCommentML(pos)) sc.push(this.getCommentML());
            else if (this.checkCommentSL(pos)) sc.push(this.getCommentSL());
            else break;
        }

        return sc;
    };

    /**
     * Check if token is part of a selector
     * @param {Number} i Token's index number
     * @returns {Number} Length of the selector
     */
    sass.checkSelector = function(i) {
        var start = i,
            l, ln;

        if (i >= tokensLength) return 0;

        ln = tokens[i].ln;

        while (i < tokensLength) {
            if (tokens[i].ln !== ln) break;

            if ((l = this.checkDeclDelim(i) && this.checkBlock(i + l)) || this.checkSC(i)) i += l;

            if (l = this.checkSimpleSelector(i) || this.checkDelim(i))  i += l;
            else break;
        }

        tokens[start].selector_end = i - 1;

        return i - start;
    };

    /**
     * @returns {Array}
     */
    sass.getSelector = function() {
        var startPos = pos,
            x = [NodeType.SelectorType],
            selector_end = tokens[pos].selector_end,
            ln = tokens[pos].ln;

        while (pos <= selector_end) {
            if (tokens[pos].ln !== ln) break;

            if ((l = this.checkDeclDelim(pos)) && this.checkBlock(pos + l)) x.push(this.getDeclDelim());
            else if (this.checkSC(pos)) x = x.concat(this.getSC());

            x.push(this.checkDelim(pos) ? this.getDelim() : this.getSimpleSelector());
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    sass.checkSimpleSelector = function(i) {
        if (i >= tokensLength) return 0;

        var start = i,
            l,
            ln = tokens[i].ln;

        while (i < tokensLength) {
            if (tokens[i].ln !== ln) break;

            if (l = this.checkSimpleSelector1(i)) i += l;
            else break;
        }

        return (i - start) || 0;
    };

    /**
     * @returns {Array}
     */
    sass.getSimpleSelector = function() {
        var startPos = pos,
            x = [NodeType.SimpleselectorType],
            t,
            ln = tokens[pos].ln;

        while (pos < tokensLength) {
            if (tokens[pos].ln !== ln ||
                !this.checkSimpleSelector1(pos)) break;

            t = this.getSimpleSelector1();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * Check if token is part of a value
     * @param {Number} i Token's index number
     * @returns {Number} Length of the value
     */
    sass.checkValue = function(i) {
        var start = i,
            l;

        while (i < tokensLength) {
            if (this.checkDeclDelim(i)) break;
            if (l = this._checkValue(i)) i += l;
            if (!l || this.checkBlock(i - l)) break;
        }

        return i - start;
    };

    /**
     * @returns {Array}
     */
    sass.getValue = function() {
        var startPos = pos,
            x = [NodeType.ValueType],
            t, _pos;

        while (pos < tokensLength) {
            _pos = pos;

            if (this.checkDeclDelim(pos)) break;

            if (!this._checkValue(pos)) break;
            t = this._getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);

            if (this.checkBlock(_pos)) break;
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
    };

    /**
     * @param {Number} i Token's index number
     * @returns {Number}
     */
    sass._checkValue = function(i) {
        return this.checkS(i) ||
            this.checkCommentML(i) ||
            this.checkCommentSL(i) ||
            this.checkVhash(i) ||
            this.checkAny(i) ||
            this.checkOperator(i) ||
            this.checkImportant(i);
    };

    /**
     * @returns {Array}
     */
    sass._getValue = function() {
        if (this.checkS(pos)) return this.getS();
        if (this.checkCommentML(pos)) return this.getCommentML();
        if (this.checkCommentSL(pos)) return this.getCommentSL();
        else if (this.checkVhash(pos)) return this.getVhash();
        else if (this.checkAny(pos)) return this.getAny();
        else if (this.checkOperator(pos)) return this.getOperator();
        else if (this.checkImportant(pos)) return this.getImportant();
    };

    /**
     * Mark whitespaces and comments
     */
    sass.markSC = function() {
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

                    tokens[ws].ws_last = i;
                    tokens[sc].sc_last = i;

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
    };

    sass.markBlocks = function() {
        var blocks = [],
            currentLN = 1,
            currentIL = 0,
            prevIL = 0,
            i = 0,
            l = tokens.length,
            iw;

        for (; i != l; i++) {
            if (!tokens[i - 1]) continue;

            // Skip all tokens on current line:
            if (tokens[i].ln == currentLN) continue;
            else currentLN = tokens[i].ln;

            // Get indent level:
            prevIL = currentIL;
            if (tokens[i].type !== TokenType.Space) currentIL = 0;
            else {
                // If we don't know ident width yet, count number of spaces:
                if (!iw) iw = tokens[i].value.length;
                prevIL = currentIL;
                currentIL = tokens[i].value.length / iw;
            }

            // Decide whether it's block's start or end:
            if (prevIL === currentIL) continue;
            else if (currentIL > prevIL) {
                blocks.push(i);
                continue;
            } else {
                var il = prevIL;
                while (blocks.length > 0 && il !== currentIL) {
                    tokens[blocks.pop()].block_end = i - 1;
                    il--;
                }
            }
        }

        while (blocks.length > 0) {
            tokens[blocks.pop()].block_end = i - 1;
        }
    };


    /**
     * Parse a multiline comment
     * @param {string} css Unparsed part of CSS string
     */
    sass.parseMLComment = function(css) {
        var start = pos;

        // Get current indent level:
        var il = 0;
        for (var _pos = pos - 1; _pos > -1; _pos--) {
            // TODO: Can be tabs:
            if (css.charAt(_pos) === ' ') il++;
            else break;
        }

        for (pos = pos + 2; pos < css.length; pos++) {
            if (css.charAt(pos) === '\n') {
                // Get new line's indent level:
                var _il = 0;
                for (var _pos = pos + 1; _pos < css.length; _pos++) {
                    if (css.charAt(_pos) === ' ') _il++;
                    else break;
                }

                if (_il > il) {
                    pos = _pos;
                } else break;
            }
        }

        // Add full comment (including `/*`) to the list of tokens:
        pushToken(TokenType.CommentML, css.substring(start, pos + 1));
    };

    /**
     * Parse a single line comment
     * @param {string} css Unparsed part of CSS string
     */
    sass.parseSLComment = function(css) {
        var start = pos;

        // Check if comment is the only token on the line, and if so,
        // get current indent level:
        var il = 0;
        var onlyToken = false;
        for (var _pos = pos - 1; _pos > -1; _pos--) {
            // TODO: Can be tabs:
            if (css.charAt(_pos) === ' ') il++;
            else if (css.charAt(_pos) === '\n') {
                onlyToken = true;
                break;
            } else break;
        }
        if (_pos === -1) onlyToken = true;

        // Read the string until we meet comment end.
        // Since we already know first 2 characters (`//`), start reading
        // from `pos + 2`:
        if (!onlyToken) {
            for (pos = pos + 2; pos < css.length; pos++) {
                if (css.charAt(pos) === '\n' || css.charAt(pos) === '\r') {
                    break;
                }
            }
        } else {
            for (pos = pos + 2; pos < css.length; pos++) {
                if (css.charAt(pos) === '\n') {
                    // Get new line's indent level:
                    var _il = 0;
                    for (var _pos = pos + 1; _pos < css.length; _pos++) {
                        if (css.charAt(_pos) === ' ') _il++;
                        else break;
                    }

                    if (_il > il) {
                        pos = _pos;
                    } else break;
                }
            }
        }

        // Add comment (including `//` and line break) to the list of tokens:
        pushToken(TokenType.CommentSL, css.substring(start, pos));
        pos--;
    };

    syntaxes.sass = sass;
})();
