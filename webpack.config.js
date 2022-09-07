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
    "editor-css": "./editor/js/editable-css.js",
    "editor-js": "./editor/js/editable-js.js",
    "editor-wat": "./editor/js/editable-wat.js",
    "css-examples-libs": "./editor/js/css-examples-libs.js",
  },
  output: {
    path: path.resolve(__dirname, "docs/js"),
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
