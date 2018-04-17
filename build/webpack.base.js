const path = require('path')
const resolve = file => path.resolve(__dirname, file)

module.exports = {
  entry: resolve('../src/index.js'),
  output: {
    path: resolve('../dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'eslint-loader',
            options: {
              enforce: 'pre',
              cacheDirectory: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
}
