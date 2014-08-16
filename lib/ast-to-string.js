module.exports = (function() {
    return function astToString(tree, level) {
        return JSON.stringify(tree, false, 2);
    };
})();
