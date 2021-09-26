const path = require('path')

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, '../dist/js'),
    filename: 'main.js'
  },
  devServer: {
    hot: true,
    progress: true,
    contentBase: path.resolve(__dirname, '../dist'),
    publicPath: '/js/',
    compress: true,
    open: 'Chrome',
    openPage: 'index.html',
    port: 8094
  }
}