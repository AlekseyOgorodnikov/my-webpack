const path = require('path')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ImageminPlugin = require("imagemin-webpack");

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            },
        },
        'css-loader', 'postcss-loader'
    ]
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const babelOptions = preset => {
    const options = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }
    if (preset) {
        options.presets.push(preset)
    }
    return options
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]
    if (isDev) {
        loaders.push('eslint-loader')
    }
    return loaders
}

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: 'src/public/index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/public/favicon.ico'),
                    to: path.resolve(__dirname, 'build')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        }),
        new ImageminPlugin({
            bail: false,
            cache: true,
            imageminOptions: {
                plugins: [
                    ["gifsicle", { interlaced: true, optimizationLevel: 3 }],
                    ["mozjpeg", { quality: 80 }],
                    ["pngquant", { quality: [0.6, 0.8] }],
                    ["svgo", {
                        plugins: [{ removeViewBox: false }]
                    }
                    ]
                ]
            }
        })
    ]
    if (isProd) {
        base.push(new BundleAnalyzerPlugin())
    }
    return base
}

module.exports = {
    entry: ['@babel/polyfill', './src/app/index.jsx'],
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'build'),
    },
    resolve: {
        alias: {
            'public': path.resolve(__dirname, 'src/public'),
            'styles': path.resolve(__dirname, 'src/styles')
        },
        extensions: [
            '.js', '.jsx', '.ts', '.json', '.png',
            '.gif', '.svg', '.jpg', '.ico', '.jpeg',
            '.xml', '.csv', '.scss', '.sass', '.css',
        ],
    },
    optimization: optimization(),
    devServer: {
        port: 8800,
        contentBase: './src/public',
        hot: isDev,
    },
    devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: cssLoaders()
            },
            {
                test: /\.less$/i,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/i,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpe?g|svg|gif)$/i,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/i,
                use: ['file-loader']
            },
            {
                test: /\.xml$/i,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/i,
                use: ['csv-loader']
            },
            {
                test: /\.json$/i,
                loader: 'json-loader'
            },
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.jsx$/i,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            }
        ]
    }
}