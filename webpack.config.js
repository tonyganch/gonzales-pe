var ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = {
  entry: {
    gonzales: './src/gonzales'
  },
  output: {
    filename: 'gonzales.js',
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
  plugins: [
    new ClosureCompilerPlugin({
      compiler: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        compilation_level: 'SIMPLE'
      },
      concurrency: 3
    })
  ]
};
