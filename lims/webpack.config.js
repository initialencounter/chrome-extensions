const path = require("path");
const CopyWebpack = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// 用于复制不参与编译的文件
const copyMap = [
  {
    from: path.resolve("src/manifest.json"),
    to: `${path.resolve("dist")}/manifest.json`,
  },
  {
    from: path.resolve("src/assets"),
    to: path.resolve("dist/assets"),
  },
  // {
  //   from: path.resolve("src/html"),
  //   to: path.resolve("dist/"),
  // },
];
//webpack的所有配置信息
module.exports = {
  optimization: {
    minimize: true,  // 关闭代码压缩，可选
    minimizer: [new TerserPlugin({ extractComments: false })],  // 关闭创建代码中的注释文件
  },
  //入口文件
  entry: {
    utils: "./src/ts/utils.ts",
    query: "./src/ts/query.ts",
    import_template: "./src/ts/import_template.ts",
    hotkey: "./src/ts/hotkey.ts",
  },
  devtool: "inline-source-map",

  devServer: {
    contentBase: "./dist",  // 开发阶段服务器的根目录
  },
  //指定打包文件所在目录
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js",  // 编译打包后的js文件名称
  },
  //用来指定那些模块可以用来备注引入
  resolve: {
    extensions: [".ts", ".js"],
  },
  //指定webpack的打包使用的模块
  module: {
    rules: [
      {
        test: /\.ts$/, //规则生效的文件
        use: {
          loader: "ts-loader", //要使用的loader
        },
        exclude: /node_modules/, //编译排除的文件
      },
    ],
  },

  plugins: [new CleanWebpackPlugin(), new CopyWebpack({ patterns: copyMap })],
};