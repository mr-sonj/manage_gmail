const webpack = require("webpack");
const fs = require('fs');
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
var ZipPlugin = require('zip-webpack-plugin');
const ENVIRONMENT = process.env.NODE_ENV;
var PACKAGE = require('../package.json');
var version = PACKAGE.version;



module.exports = {
    entry: {
        background: path.join(srcDir, 'background.ts')
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
              return chunk.name !== 'background';
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { 
                    from: ".", 
                    to: "../", 
                    context: "public",
                    filter: async (resourcePath) => {
                        // console.log(resourcePath);
                        if(resourcePath.includes("manifest.json") && ENVIRONMENT==='production'){
                            const data = await fs.promises.readFile(resourcePath);
                            const content = data.toString();
                            var ct = JSON.parse(content);
                            ct.version = version;
                            ct = JSON.stringify(ct, null, 4);
                            
                            fs.writeFile('public/manifest.json',  Buffer.from(ct, "utf-8"), function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                            })
                            
                        }else if(resourcePath.includes("popup.html") && ENVIRONMENT==='production'){
                            const data = await fs.promises.readFile(resourcePath);
                            const content = data.toString();
                            var current_version = content.split('<version>')[1].split('</version>')[0];
                            var ct = content.replace(current_version, version);
                            fs.writeFile('public/popup.html',  Buffer.from(ct, "utf-8"), function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                            })
                        }

                        
                        return true;
                    },
                }
            ],
            options: {},
        }),
        ENVIRONMENT==='production' && new ZipPlugin({
            // OPTIONAL: defaults to the Webpack output path (above)
            // can be relative (to Webpack output path) or absolute
            path: '../../files',
        
            // OPTIONAL: defaults to the Webpack output filename (above) or,
            // if not present, the basename of the path
            filename: 'extension_manage_gmail_v'+version+'.zip',
        
            // OPTIONAL: defaults to 'zip'
            // the file extension to use instead of 'zip'
            extension: 'zip',
        
            // OPTIONAL: defaults to the empty string
            // the prefix for the files included in the zip file
            pathPrefix: 'js',
        
            // OPTIONAL: defaults to the identity function
            // a function mapping asset paths to new paths
            // pathMapper: function(assetPath) {
            //     // put all pngs in an `images` subdir
            //     console.log(assetPath);
            //     // if (assetPath.endsWith('.png'))
            //     //     return path.join(path.dirname(assetPath), 'images', path.basename(assetPath));
            //     return assetPath;
            // },
        
            // OPTIONAL: defaults to including everything
            // can be a string, a RegExp, or an array of strings and RegExps
            // include: [/\.css$/],
        
            // OPTIONAL: defaults to excluding nothing
            // can be a string, a RegExp, or an array of strings and RegExps
            // if a file matches both include and exclude, exclude takes precedence
            // exclude: [/\.png$/, /\.html$/],
        
            // yazl Options
        
            // OPTIONAL: see https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
            fileOptions: {
                mtime: new Date(),
                mode: 0o100664,
                compress: true,
                forceZip64Format: false,
            },
        
            // OPTIONAL: see https://github.com/thejoshwolfe/yazl#endoptions-finalsizecallback
            zipOptions: {
                forceZip64Format: false,
            },
        })
    ].filter(n => n)
};
