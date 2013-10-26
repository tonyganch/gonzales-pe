/**
 * Parse CSS: convert a CSS string to AST
 */
var cssToAST = (function() {
    var syntax = {}, // List of supported syntaxes
        s, // syntax of current stylesheet
        needInfo,
        tokens, // list of tokens
        tokensLength, // number of tokens in the list
        pos = 0; // position of current token in tokens' list
