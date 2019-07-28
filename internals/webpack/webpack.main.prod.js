import path from 'path';
import webpack from 'webpack';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import baseConfig from './webpack.base.babel';

export default baseConfig({
  devtool: false,
  mode: 'production',
  target: 'electron-main',
  entry: path.resolve(process.cwd(), 'app/electron/main.dev.js'),
  output: {
    path: path.resolve(process.cwd(), 'app/electron/'),
    filename: './main.prod.js',
  },
  optimization: {
    minimize: true,
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
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
});
