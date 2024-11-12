const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const NodePolyfillWebpackPlugin = require("node-polyfill-webpack-plugin")
const { VantResolver } = require("unplugin-vue-components/resolvers")
const ComponentsPlugin = require("unplugin-vue-components/webpack")

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillWebpackPlugin(),
      ComponentsPlugin.default({ resolvers: [VantResolver()] }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    devtool: 'source-map',
    resolve: {
      fallback: {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        os: require.resolve("os-browserify/browser"),
        url: require.resolve("url"),
        assert: require.resolve("assert"),
      },
    },
  }
})
