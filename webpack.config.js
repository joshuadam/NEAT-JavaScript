const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'NEAT-JavaScript.js',
    library: 'NEATJavaScript',
    libraryTarget: 'umd'
  },
};