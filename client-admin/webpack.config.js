// Copyright (C) 2012-present, The Authors. This program is free software: you can redistribute it and/or  modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

var path = require("path");
var webpack = require("webpack");
var CompressionPlugin = require('compression-webpack-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var HtmlWebPackPlugin = require('html-webpack-plugin');
var EventHooksPlugin = require('event-hooks-webpack-plugin');
var CopyPlugin = require("copy-webpack-plugin");
var TerserPlugin = require("terser-webpack-plugin");
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
var mri = require('mri');
var glob = require('glob');
var fs = require('fs');
var { boolean: isTrue } = require("boolean");

// CLI commands for deploying built artefact.
var argv = process.argv.slice(2)
var cliArgs = mri(argv)

var polisConfig = require("./polis.config");

module.exports = (env, options) => {
  var isDev = options.mode === 'development';
  var chunkHashFragment = isDev ? '' : '.[chunkhash:8]';
  return {
    entry: ["./src/index"],
    output: {
      filename: `static/js/admin_bundle${chunkHashFragment}.js`,
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      extensions: [".js", ".css", ".png", ".svg"],
    },
    plugins: [
      ...(cliArgs.analyze ? [new BundleAnalyzerPlugin({ defaultSizes: 'gzip' })] : []),
      new CopyPlugin({
        patterns: [
          { from: 'public', globOptions: { ignore: ['**/index.html']}},
        ],
      }),
      new HtmlWebPackPlugin({
        template: path.resolve( __dirname, 'public/index.html' ),
        filename: isDev ? 'index.html' : 'index_admin.html',
        templateParameters: {
          domainWhitelist: `["${polisConfig.domainWhitelist.join('","')}"]`,
          fbAppId: polisConfig.FB_APP_ID,
          usePlans: !isTrue(polisConfig.DISABLE_PLANS),
          useIntercom: !isTrue(polisConfig.DISABLE_INTERCOM),
        },
      }),
      new LodashModuleReplacementPlugin({
        currying: true,
        flattening: true,
        paths: true,
        placeholders: true,
        shorthands: true
      }),
      new CompressionPlugin({
        test: /\.js$/,
        // Leave unmodified without gz ext.
        // See: https://webpack.js.org/plugins/compression-webpack-plugin/#options
        filename: '[path][base]',
        deleteOriginalAssets: true,
        // Exclude all (aka disable) files from compression in dev mode.
        // Also disable when analyzing, as that confuses BundleAnalyzerPlugin.
        exclude: (isDev || cliArgs.analyze) ? /.*/ : undefined,
      }),
      new EventHooksPlugin({
        afterEmit: () => {
          console.log('Writing *.headersJson files...')

          function writeHeadersJson(matchGlob, headersData = {}) {
            const files = glob.sync(path.resolve(__dirname, "dist", matchGlob))
            files.forEach((f, i) => {
              const headersFilePath = f + '.headersJson'
              fs.writeFileSync(headersFilePath, JSON.stringify(headersData))
            })
          }

          function writeHeadersJsonHtml() {
            const headersData = {
              'x-amz-acl': 'public-read',
              'Content-Type': 'text/html; charset=UTF-8',
              'Cache-Control': 'no-cache'
            }
            writeHeadersJson('*.html', headersData)
          }

          function writeHeadersJsonJs() {
            const headersData = {
              'x-amz-acl': 'public-read',
              'Content-Encoding': 'gzip',
              'Content-Type': 'application/javascript',
              'Cache-Control':
                'no-transform,public,max-age=31536000,s-maxage=31536000'
            }
            writeHeadersJson('static/js/*.js?(.map)', headersData)
          }

          function writeHeadersJsonMisc() {
            writeHeadersJson('favicon.ico')
          }

          writeHeadersJsonHtml()
          writeHeadersJsonJs()
          writeHeadersJsonMisc()
        }
      })
    ],
    optimization: {
      minimize: !isDev,
      minimizer: [new TerserPlugin()],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
        },
        {
          test: /\.mdx?$/,
          use: ['babel-loader', '@mdx-js/loader']
        }
      ],
    },
  };
}
