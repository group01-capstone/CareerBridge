// webpack.config.js (replace yours with this small update)
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: { app: "./jsx/MainPage.jsx" },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "public"),
    publicPath: "/", // safer for dynamic asset loading
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: "file-loader",
            options: { name: "[name].[ext]", outputPath: "img/" },
          },
        ],
      },
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {
                targets: { ie: "11", edge: "15", safari: "10", firefox: "50", chrome: "49" }
              }],
              "@babel/preset-react",
            ],
          },
        },
      },
    ],
  },
  optimization: { splitChunks: { name: "vendor", chunks: "all" } },
  plugins: [
    // 👇 Build-time constant for your API base URL
    new webpack.DefinePlugin({
      __SERVER_URL__: JSON.stringify(process.env.SERVER_URL || "http://localhost:5000"),
    }),
  ],
  devtool: "source-map",
};
