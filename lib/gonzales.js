// CSSP

exports.cssToAST = require('./gonzales.cssp.node.js').cssToAST;

exports.astToCSS = require('./cssp.translator.node.js').astToCSS;

exports.astToTree = function(tree, level) {
    level = level || 0;
    var spaces = dummySpaces(level),
        s = (level ? '\n' + spaces : '') + '[';

    tree.forEach(function(e) {
        if (e.ln === undefined) {
            s += (Array.isArray(e) ? exports.astToTree(e, level + 1) : ('\'' + e.toString() + '\'')) + ', ';
        }
    });

    return s.substr(0, s.length - 2) + ']';
}

function dummySpaces(num) {
    return '                                                  '.substr(0, num * 2);
}
