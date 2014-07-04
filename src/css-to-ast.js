/**
 * Parse CSS: convert a CSS string to AST
 */
var cssToAST = (function() {
    var syntaxes = {}, // list of supported syntaxes
        s, // syntax of current stylesheet
        tokens, // list of tokens
        tokensLength, // number of tokens in the list
        tn = 0, // token number
        ln = 1, // line number
        pos = 0; // position of current token in tokens' list or current character in a string

    /**
     * Add a token to the token list
     * @param {string} type
     * @param {string} value
     */
    function pushToken(type, value) {
        tokens.push({ tn: tn++, ln: ln, type: type, value: value });
    }

    /**
     * Stop parsing and display error
     * @param {Number=} i Token's index number
     */
    function throwError(i) {
        var ln = i ? tokens[i].ln : tokens[pos].ln;

        throw new Error('Please check the validity of the CSS block starting from the line #' + ln);
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
