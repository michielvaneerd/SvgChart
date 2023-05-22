const path = require('path');
module.exports = {
    mode: 'production', // we only use webpack for production umd builds.
    entry: './src/svg.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'svgchart.umd.js',
        path: path.resolve(__dirname, 'dist'),
        //library: 'svgChart'
        globalObject: 'this',
        library: {
            name: 'svgChart',
            type: 'umd'
        }
    },
};