const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  plugins: [
    new webpack.BannerPlugin(
      "mdn-bob (Builder of Bits) - © Mozilla Corporation, MIT license"
    ),
  ],
  entry: {
    "editor-tabbed": "./editor/js/editor.js",
    "editor-css": "./editor/js/editable-css.js",
    "editor-js": "./editor/js/editable-js.js",
    "editor-wat": "./editor/js/editable-wat.js",
    "css-examples-libs": "./editor/js/css-examples-libs.js",
  },
  output: {
    path: path.resolve(__dirname, "docs/js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
    },
  },
  optimization: {
    splitChunks: {
      chunks: "async",
    },
  },
};
