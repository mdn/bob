import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const require = createRequire(import.meta.url);

export default {
  mode: "production",
  plugins: [
    new webpack.BannerPlugin(
      "mdn-bob (Builder of Bits) - © Mozilla Corporation, MIT license"
    ),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  entry: {
    "editor-tabbed": "./editor/js/editor.js",
    "editor-css": "./editor/js/editable-css.js",
    "editor-js": "./editor/js/editable-js.js",
    "editor-wat": "./editor/js/editable-wat.js",
    "css-examples-libs": "./editor/js/css-examples-libs.js",
  },
  output: {
    path: fileURLToPath(new URL("docs", import.meta.url)),
    filename: "js/[name].js",
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                // publicPath is the relative path of the resource to the context
                // e.g. for ./css/admin/main.css the publicPath will be ../../
                // while for ./css/main.css the publicPath will be ../
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
        ],
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
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: "async",
    },
  },
};
