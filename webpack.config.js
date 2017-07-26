const path = require('path')
const webpack = require('webpack')

module.exports = (env) => {
  const isDev = env === 'development'

  return {
    context: path.resolve(__dirname),
    entry: {
      main: './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? 'seamless.js' : 'seamless.min.js'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      loaders: [
        { test: /\.css$/, loader: 'style-loader!css-loader' },
        { test: /\.(js|jsx)$/, exclude: /node_modules/, loader: 'babel-loader' },
        { test: /\.(jpe?g|png|gif)$/, loader: 'file-loader', query: { name: 'assets/img/[name].[ext]' } }
      ]
    },
    devServer: {
      // historyApiFallback: true,
      contentBase: path.join(__dirname, 'dist'),
      port: 3001,
      // hot: true,
      compress: true,
      publicPath: '/',
      stats: 'minimal'
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: isDev ? '"development"' : '"production"' }
      })
    ].concat(
      !isDev ? [ new webpack.optimize.UglifyJsPlugin() ] : []
    )
  }
}
