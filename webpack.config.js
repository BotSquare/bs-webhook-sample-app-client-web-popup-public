const path = require('path');

module.exports = {
  entry: './src/ChatbotWidget.tsx', // Ensure entry is pointing to the correct file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'chatbot-widget.js',
    library: 'ChatbotWidget',
    libraryTarget: 'umd',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.scss$/, // This will apply to both .scss and .sass files
        use: [
          'style-loader', // Injects styles into DOM
          'css-loader',   // Turns css into commonjs
          'sass-loader'   // Turns sass into css
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'] // Ensures Webpack looks in the local node_modules first
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 9000,
    hot: true,
  },
};
