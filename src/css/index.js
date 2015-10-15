'use strict';

export default function moduleDef(gonzalesInstance) {
  return gonzalesInstance.registerSyntax({
    mark: require('./mark'),
    parse: require('./parse'),
    stringify: require('./stringify'),
    tokenizer: require('./tokenizer')
  }, 'css');
}