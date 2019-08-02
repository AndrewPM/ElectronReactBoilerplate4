import path from 'path';
import webpack from 'webpack';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import baseConfig from './webpack.base.babel';
const nodeExternals = require('webpack-node-externals');

export default baseConfig({
  devtool: 'source-map',
  mode: 'development',
  target: 'electron-main',
  entry: path.resolve(process.cwd(), 'app/electron/main.dev.js'),
  output: {
    path: path.resolve(process.cwd(), 'app/electron/'),
    filename: './main.prod.js',
  },
  optimization: {
    minimize: false,
    minimizer: [
      new UglifyJSPlugin({
        parallel: true,
        sourceMap: true,
        cache: true,
      }),
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG_PROD: true,
      START_MINIMIZED: false,
    }),
    // new webpack.ContextReplacementPlugin(/bindings$/, /^$/),
  ],

  //externals: [nodeExternals()],
  //externals: { ffi: 'ffi' },
  node: {
    __dirname: true,
    __filename: true,
  },
});
