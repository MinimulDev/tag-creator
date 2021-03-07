const path = require("path")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const webpack = require("webpack")

const srcDir = path.resolve(__dirname, "../src")
const distDir = path.resolve(__dirname, "../dist")

module.exports = {
    entry: path.resolve(srcDir, "./index.ts"),
    target: "node",
    output: {
        path: distDir,
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts"]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin()
    ]
}