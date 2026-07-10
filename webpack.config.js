const path = require('path');

// Bundles the tsc output (run `npm run build` first, or use `npm run build:umd`).
module.exports = {
  mode: 'production',
  entry: './dist/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'NEAT-JavaScript.js',
    library: 'NEATJavaScript',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
};
