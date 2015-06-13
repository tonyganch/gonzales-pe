var fs = require('fs');
var ParsingError = require('./parsing-error');
var RootNode = require('./node/root-node');

var Defaults = {
    SYNTAX: 'css',
    NEED_INFO: false,
    CSS_RULE: 'stylesheet',
    JS_RULE: 'program'
};

/**
 * @param {String} css
 * @param {Object} options
 * @return {Object} AST
 */
function parse(css, options) {
    if (typeof css !== 'string')
        throw new Error('Please, pass a string to parse');
    else if (!css)
        return require('./node/empty-node')();

    var syntax = options && options.syntax || Defaults.SYNTAX;
    var needInfo = options && options.needInfo || Defaults.NEED_INFO;
    var rule = options && options.rule ||
        (syntax === 'js' ? Defaults.JS_RULE : Defaults.CSS_RULE);

    if (!fs.existsSync(__dirname + '/' + syntax))
        return console.error('Syntax "' + syntax + '" is not supported yet, sorry');

    var getTokens = require('./' + syntax + '/tokenizer');
    var mark = require('./' + syntax + '/mark');
    var parse = require('./' + syntax + '/parse');

    var tokens = getTokens(css);
    mark(tokens);

    try {
        var ast = parse(tokens, rule, needInfo);
    } catch (e) {
        throw new ParsingError(e, css);
    }

    return new RootNode(ast);
}

function buildIndex(ast, index, indexHasChanged) {
    if (!Array.isArray(ast.content)) return;

    for (var i = 0, l = ast.content.length; i < l; i++) {
        var node = ast.content[i];
        if (!index[node.type]) index[node.type] = [];
        node.indexHasChanged = indexHasChanged;
        index[node.type].push({
            node: node,
            parent: ast,
            i: i
        });

        buildIndex(node, index, indexHasChanged);
    }
}

function traverseByType(type, callback) {
    if (!this.index) {
        this.index = {stylesheet: [this]};
        this.indexHasChanged = [0];
        buildIndex(this, this.index, this.indexHasChanged);
    }

    var nodes = this.index[type];
    var breakLoop;

    if (!nodes) return;

    for (var i = 0, l = nodes.length; i < l; i++) {
        if (this.indexHasChanged[0]) {
            this.index = {stylesheet: [this]};
            this.indexHasChanged = [0];
            buildIndex(this, this.index, this.indexHasChanged);
            nodes = this.index[type];
            i += nodes.length - l;
            l = nodes.length;
        }

        var node = nodes[i];
        breakLoop = callback(node.node, node.i, node.parent);
        if (breakLoop === null) break;
    }
}

function traverseByTypes(types, callback) {
    for (var i = 0, l = types.length; i < l; i++) {
        this.traverseByType(types[i], callback);
    }
}

module.exports = parse;
