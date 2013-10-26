var NodeType = {
    ArgumentsType: 'arguments',
    AtkeywordType: 'atkeyword',
    AtrulebType: 'atruleb',
    AtrulerType: 'atruler',
    AtrulerqType: 'atrulerq',
    AtrulersType: 'atrulers',
    AtrulesType: 'atrules',
    AttribType: 'attrib',
    AttrselectorType: 'attrselector',
    BlockType: 'block',
    BracesType: 'braces',
    CdcType: 'cdc',
    CdoType: 'cdo',
    ClassType: 'class',
    CombinatorType: 'combinator',
    CommentMLType: 'commentML',
    CommentSLType: 'commentSL',
    ConditionType: 'condition',
    DeclarationType: 'declaration',
    DecldelimType: 'decldelim',
    DefaultType: 'default',
    DelimType: 'delim',
    DimensionType: 'dimension',
    FilterType: 'filter',
    FiltervType: 'filterv',
    FunctionType: 'function',
    FunctionBodyType: 'functionBody',
    FunctionExpressionType: 'functionExpression',
    IdentType: 'ident',
    ImportantType: 'important',
    IncludeType :'include',
    InterpolatedVariableType: 'interpolatedVariable',
    LoopType: 'loop',
    MixinType: 'mixin',
    NamespaceType: 'namespace',
    NthType: 'nth',
    NthselectorType: 'nthselector',
    NumberType: 'number',
    OperatorType: 'operator',
    ParentSelectorType: 'parentselector',
    PercentageType: 'percentage',
    PlaceholderType: 'placeholder',
    ProgidType: 'progid',
    PseudocType: 'pseudoc',
    PseudoeType: 'pseudoe',
    PropertyType: 'property',
    RawType: 'raw',
    RulesetType: 'ruleset',
    SType: 's',
    SelectorType: 'selector',
    ShashType: 'shash',
    SimpleselectorType: 'simpleselector',
    StringType: 'string',
    StylesheetType: 'stylesheet',
    UnaryType: 'unary',
    UnknownType: 'unknown',
    UriType: 'uri',
    ValueType: 'value',
    VariableType: 'variable',
    VariablesListType: 'variableslist',
    VhashType: 'vhash'
};

    var rules = {
        'arguments': function() { if (s.checkArguments(pos)) return s.getArguments() },
        'atkeyword': function() { if (s.checkAtkeyword(pos)) return s.getAtkeyword() },
        'atruleb': function() { if (s.checkAtruleb(pos)) return s.getAtruleb() },
        'atruler': function() { if (s.checkAtruler(pos)) return s.getAtruler() },
        'atrulerq': function() { if (s.checkAtrulerq(pos)) return s.getAtrulerq() },
        'atrulers': function() { if (s.checkAtrulers(pos)) return s.getAtrulers() },
        'atrules': function() { if (s.checkAtrules(pos)) return s.getAtrules() },
        'attrib': function() { if (s.checkAttrib(pos)) return s.getAttrib() },
        'attrselector': function() { if (s.checkAttrselector(pos)) return s.getAttrselector() },
        'block': function() { if (s.checkBlock(pos)) return s.getBlock() },
        'braces': function() { if (s.checkBraces(pos)) return s.getBraces() },
        'class': function() { if (s.checkClass(pos)) return s.getClass() },
        'combinator': function() { if (s.checkCombinator(pos)) return s.getCombinator() },
        'commentML': function() { if (s.checkCommentML(pos)) return s.getCommentML() },
        'commentSL': function() { if (s.checkCommentSL(pos)) return s.getCommentSL() },
        'condition': function() { if (s.checkCondition(pos)) return s.getCondition() },
        'declaration': function() { if (s.checkDeclaration(pos)) return s.getDeclaration() },
        'decldelim': function() { if (s.checkDecldelim(pos)) return s.getDecldelim() },
        'default': function () { if (s.checkDefault(pos)) return s.getDefault() },
        'delim': function() { if (s.checkDelim(pos)) return s.getDelim() },
        'dimension': function() { if (s.checkDimension(pos)) return s.getDimension() },
        'filter': function() { if (s.checkFilter(pos)) return s.getFilter() },
        'filterv': function() { if (s.checkFilterv(pos)) return s.getFilterv() },
        'functionExpression': function() { if (s.checkFunctionExpression(pos)) return s.getFunctionExpression() },
        'function': function() { if (s.checkFunction(pos)) return s.getFunction() },
        'ident': function() { if (s.checkIdent(pos)) return s.getIdent() },
        'important': function() { if (s.checkImportant(pos)) return s.getImportant() },
        'include': function () { if (s.checkInclude(pos)) return s.getInclude() },
        'interpolatedVariable': function () { if (s.checkInterpolatedVariable(pos)) return s.getInterpolatedVariable() },
        'loop': function() { if (s.checkLoop(pos)) return s.getLoop() },
        'mixin': function () { if (s.checkMixin(pos)) return s.getMixin() },
        'namespace': function() { if (s.checkNamespace(pos)) return s.getNamespace() },
        'nth': function() { if (s.checkNth(pos)) return s.getNth() },
        'nthselector': function() { if (s.checkNthselector(pos)) return s.getNthselector() },
        'number': function() { if (s.checkNumber(pos)) return s.getNumber() },
        'operator': function() { if (s.checkOperator(pos)) return s.getOperator() },
        'parentselector': function () { if (s.checkParentSelector(pos)) return s.getParentSelector() },
        'percentage': function() { if (s.checkPercentage(pos)) return s.getPercentage() },
        'placeholder': function() { if (s.checkPlaceholder(pos)) return s.getPlaceholder() },
        'progid': function() { if (s.checkProgid(pos)) return s.getProgid() },
        'property': function() { if (s.checkProperty(pos)) return s.getProperty() },
        'pseudoc': function() { if (s.checkPseudoc(pos)) return s.getPseudoc() },
        'pseudoe': function() { if (s.checkPseudoe(pos)) return s.getPseudoe() },
        'ruleset': function() { if (s.checkRuleset(pos)) return s.getRuleset() },
        's': function() { if (s.checkS(pos)) return s.getS() },
        'selector': function() { if (s.checkSelector(pos)) return s.getSelector() },
        'shash': function() { if (s.checkShash(pos)) return s.getShash() },
        'simpleselector': function() { if (s.checkSimpleSelector(pos)) return s.getSimpleSelector() },
        'string': function() { if (s.checkString(pos)) return s.getString() },
        'stylesheet': function() { if (s.checkStylesheet(pos)) return s.getStylesheet() },
        'unary': function() { if (s.checkUnary(pos)) return s.getUnary() },
        'unknown': function() { if (s.checkUnknown(pos)) return s.getUnknown() },
        'uri': function() { if (s.checkUri(pos)) return s.getUri() },
        'value': function() { if (s.checkValue(pos)) return s.getValue() },
        'variable': function () { if (s.checkVariable(pos)) return s.getVariable() },
        'variableslist': function () { if (s.checkVariablesList(pos)) return s.getVariablesList() },
        'vhash': function() { if (s.checkVhash(pos)) return s.getVhash() }
    };

    /**
     * Stop parsing and display error
     * @param {Number=} i Token's index number
     */
    function throwError(i) {
        var ln = i ? tokens[i].ln : tokens[pos].ln;

        throw new Error('Please check the validity of the CSS block starting from the line #' + ln);
    }

    /**
     * Get info object
     * @param {Number} i Token's index number
     * @returns {{ln: {Number}, tn: {Number}}}
     */
    function getInfo(i) {
        return { ln: tokens[i].ln, tn: tokens[i].tn };
    }

        /**
     * @param {object} exclude
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
