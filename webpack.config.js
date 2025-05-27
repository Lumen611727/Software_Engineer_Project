const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const antlr4 = require('antlr4');


module.exports = {
  mode: 'development',  // or 'production'
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]"
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/ // Exclude node_modules from babel-loader
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['c'],
    }),
  ],
};
