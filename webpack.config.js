var syntax = process.env.SYNTAX && process.env.SYNTAX.toLowerCase();

module.exports = {
  entry: {
    gonzales: './src/gonzales'
  },
  output: {
    filename: syntax ? 'gonzales-' + syntax + '.js' : 'gonzales.js',
    library: 'gonzales',
    libraryTarget: 'umd',
    path: __dirname + '/lib'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          loose: 'all',
          blacklist: 'spec.functionName'
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: ['src'],
    alias: {
      syntaxes: syntax ?
          __dirname + '/src/' + syntax :
          __dirname + '/src/syntaxes'
    }
  }
};
