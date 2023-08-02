import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import webpack, { Configuration } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const require = createRequire(import.meta.url);

const config: Configuration = {
  mode: "production",
  plugins: [
    new webpack.BannerPlugin(
      "mdn-bob (Builder of Bits) - © Mozilla Corporation, MIT license",
    ),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  entry: {
    "editor-tabbed": {
      import: fileURLToPath(new URL("./editor/js/editor.js", import.meta.url)),
      dependOn: "codemirror",
    },
    "editor-css": {
      import: fileURLToPath(
        new URL("./editor/js/editable-css.js", import.meta.url),
      ),
      dependOn: "codemirror",
    },
    "editor-js": {
      import: fileURLToPath(
        new URL("./editor/js/editable-js.js", import.meta.url),
      ),
      dependOn: "codemirror",
    },
    "editor-wat": {
      import: fileURLToPath(
        new URL("./editor/js/editable-wat.js", import.meta.url),
      ),
      dependOn: "codemirror",
    },
    codemirror: fileURLToPath(
      new URL("./editor/js/editor-libs/codemirror-editor.js", import.meta.url),
    ),
  },
  output: {
    path: path.join(process.cwd(), "docs"),
    filename: "js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
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
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
    },
  },
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
    splitChunks: {
      chunks: "async",
    },
  },
};

export default config;
