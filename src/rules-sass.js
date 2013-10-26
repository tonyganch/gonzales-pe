(function() {
    var sass = Object.create(syntax.scss);

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
     * Check if token is a semicolon
     * @param {Number} i Token's index number
     * @returns {Number} `1` if token is a semicolon, otherwise `0`
     */
    sass.checkDecldelim = function(i) {
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

        if (this.checkDecldelim(i)) return i - start;

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

        if (this.checkDecldelim(pos)) return needInfo ? (x.unshift(getInfo(startPos)), x) : x;

        if (this.checkSC(pos)) x = x.concat(this.getSC());

        if (pos < tokensLength && this.checkImportant(pos)) x.push(this.getImportant());

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

            if ((l = this.checkDecldelim(i) && this.checkBlock(i + l)) || this.checkSC(i)) i += l;

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

            if ((l = this.checkDecldelim(pos)) && this.checkBlock(pos + l)) x.push(this.getDecldelim());
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
            if (this.checkDecldelim(i)) break;
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

            if (this.checkDecldelim(pos)) break;

            if (!this._checkValue(pos)) break;
            t = this._getValue();

            if ((needInfo && typeof t[1] === 'string') || typeof t[0] === 'string') x.push(t);
            else x = x.concat(t);

            if (this.checkBlock(_pos)) break;
        }

        return needInfo ? (x.unshift(getInfo(startPos)), x) : x;
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

    syntax.sass = sass;
})();
