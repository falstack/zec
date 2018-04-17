const path = require('path')
const resolve = file => path.resolve(__dirname, file)
const merge = require('webpack-merge')
const base = require('./webpack.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const webpack = require('webpack')
const name = require('../package.json').name

module.exports = merge(base, {
  mode: 'development',
  output: {
    filename: `${name}.js`
  },
  devServer: {
    host: '0.0.0.0',
    port: 5000,
    hot: true,
    overlay: true
  },
  plugins: [
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('./template.html'),
      title: name,
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
})
