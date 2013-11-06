var getTokens = (function() {

    var Punctuation,  // punctuation marks
        urlMode = false,
        blockMode = 0,
        tokens = [], // list of tokens
        pos, // position of current character in a string
        tn = 0, // token number
        ln = 1; // line number

    Punctuation = {
        ' ': TokenType.Space,
        '\n': TokenType.Newline,
        '\r': TokenType.Newline,
        '\t': TokenType.Tab,
        '!': TokenType.ExclamationMark,
        '"': TokenType.QuotationMark,
        '#': TokenType.NumberSign,
        '$': TokenType.DollarSign,
        '%': TokenType.PercentSign,
        '&': TokenType.Ampersand,
        '\'': TokenType.Apostrophe,
        '(': TokenType.LeftParenthesis,
        ')': TokenType.RightParenthesis,
        '*': TokenType.Asterisk,
        '+': TokenType.PlusSign,
        ',': TokenType.Comma,
        '-': TokenType.HyphenMinus,
        '.': TokenType.FullStop,
        '/': TokenType.Solidus,
        ':': TokenType.Colon,
        ';': TokenType.Semicolon,
        '<': TokenType.LessThanSign,
        '=': TokenType.EqualsSign,
        '>': TokenType.GreaterThanSign,
        '?': TokenType.QuestionMark,
        '@': TokenType.CommercialAt,
        '[': TokenType.LeftSquareBracket,
        ']': TokenType.RightSquareBracket,
        '^': TokenType.CircumflexAccent,
        '_': TokenType.LowLine,
        '{': TokenType.LeftCurlyBracket,
        '|': TokenType.VerticalLine,
        '}': TokenType.RightCurlyBracket,
        '~': TokenType.Tilde
    };

    /**
     * Check if a character is a decimal digit
     * @param {string} c Character
     * @returns {boolean}
     */
    function isDecimalDigit(c) {
        return '0123456789'.indexOf(c) >= 0;
    }

    /**
     * Add a token to the token list
     * @param {string} type
     * @param {string} value
     */
    function pushToken(type, value) {
        tokens.push({ tn: tn++, ln: ln, type: type, value: value });
    }

    /**
     * Parse spaces
     * @param {string} s Unparsed part of CSS string
     */
    function parseSpaces(s) {
        var start = pos;

        // Read the string until we meet a non-space character:
        for (; pos < s.length; pos++) {
            if (s.charAt(pos) !== ' ') break;
        }

        // Add a substring containing only spaces to tokens:
        pushToken(TokenType.Space, s.substring(start, pos));
        pos--;
    }

    /**
     * Parse a multiline comment
     * @param {string} s Unparsed part of CSS string
     */
    function parseMLComment(s) {
        var start = pos;

        // Read the string until we meet `*/`.
        // Since we already know first 2 characters (`/*`), start reading
        // from `pos + 2`:
        for (pos = pos + 2; pos < s.length; pos++) {
            if (s.charAt(pos) === '*' && s.charAt(pos + 1) === '/') {
                pos++;
                break;
            }
        }

        // Add full comment (including `/*` and `*/`) to the list of tokens:
        pushToken(TokenType.CommentML, s.substring(start, pos + 1));
    }

    /**
     * Parse a single line comment
     * @param {string} s Unparsed part of CSS string
     */
    function parseSLComment(s) {
        var start = pos;

        // Read the string until we meet line break.
        // Since we already know first 2 characters (`//`), start reading
        // from `pos + 2`:
        for (pos = pos + 2; pos < s.length; pos++) {
            if (s.charAt(pos) === '\n' || s.charAt(pos) === '\r') {
                break;
            }
        }

        // Add comment (including `//` and line break) to the list of tokens:
        pushToken(TokenType.CommentSL, s.substring(start, pos));
        pos--;
    }

    /**
     * Parse a string within quotes
     * @param {string} s Unparsed part of CSS string
     * @param {string} q Quote (either `'` or `"`)
     */
    function parseString(s, q) {
        var start = pos;

        // Read the string until we meet a matching quote:
        for (pos = pos + 1; pos < s.length; pos++) {
            // Skip escaped quotes:
            if (s.charAt(pos) === '\\') pos++;
            else if (s.charAt(pos) === q) break;
        }

        // Add the string (including quotes) to tokens:
        pushToken(q === '"' ? TokenType.StringDQ : TokenType.StringSQ, s.substring(start, pos + 1));
    }

    /**
     * Parse numbers
     * @param {string} s Unparsed part of CSS string
     */
    function parseDecimalNumber(s) {
        var start = pos;

        // Read the string until we meet a character that's not a digit:
        for (; pos < s.length; pos++) {
            if (!isDecimalDigit(s.charAt(pos))) break;
        }

        // Add the number to tokens:
        pushToken(TokenType.DecimalNumber, s.substring(start, pos));
        pos--;
    }

    /**
     * Parse identifier
     * @param {string} s Unparsed part of CSS string
     */
    function parseIdentifier(s) {
        var start = pos;

        // Skip all opening slashes:
        while (s.charAt(pos) === '/') pos++;

        // Read the string until we meet a punctuation mark:
        for (; pos < s.length; pos++) {
            // Skip all '\':
            if (s.charAt(pos) === '\\') pos++;
            else if (s.charAt(pos) in Punctuation) break;
        }

        var ident = s.substring(start, pos);

        // Enter url mode if parsed substring is `url`:
        urlMode = urlMode || ident === 'url';

        // Add identifier to tokens:
        pushToken(TokenType.Identifier, ident);
        pos--;
    }

    /**
     * Convert a CSS string to a list of tokens
     * @param {string} s CSS string
     * @returns {Array} List of tokens
     * @private
     */
    function _getTokens(s, syntax) {
        var c, // current character
            cn; // next character

        // Reset counters:
        tokens = [];
        pos = 0;
        tn = 0;
        ln = 1;

        // Parse string, character by character:
        for (pos = 0; pos < s.length; pos++) {
            c = s.charAt(pos);
            cn = s.charAt(pos + 1);

            // If we meet `/*`, it's a start of a multiline comment.
            // Parse following characters as a multiline comment:
            if (c === '/' && cn === '*') {
                parseMLComment(s);
            }
            // If we meet `//` and it is not a part of url:
            else if (!urlMode && c === '/' && cn === '/') {
                if (syntax !== 'css') parseSLComment(s);
                else {
                    // If we're currently inside a block, treat `//` as a start
                    // of identifier:
                    if (blockMode > 0) parseIdentifier(s);
                    // If we're currently not inside a block, treat `//` as
                    // a start of a single line comment:
                    else parseSLComment(s);
                }
            }
            // If current character is a double or single quote, it's a start
            // of a string:
            else if (c === '"' || c === "'") {
                parseString(s, c);
            }
            // If current character is a space:
            else if (c === ' ') {
                parseSpaces(s)
            }
            // If current character is a punctuation mark:
            else if (c in Punctuation) {
                // Add it to the list of tokens:
                pushToken(Punctuation[c], c);
                if (c === '\n' || c === '\r') ln++; // Go to next line
                if (c === ')') urlMode = false; // exit url mode
                if (c === '{') blockMode++; // enter a block
                if (c === '}') blockMode--; // exit a block
            }
            // If current character is a decimal digit:
            else if (isDecimalDigit(c)) {
                parseDecimalNumber(s);
            }
            // If current character is anything else:
            else {
                parseIdentifier(s);
            }
        }

        return tokens;
    }

    return function(s, syntax) {
        return _getTokens(s, syntax);
    };

}());
