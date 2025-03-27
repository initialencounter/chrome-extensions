// build.js
const path = require('path')
require('esbuild').build({
    entryPoints: [path.resolve(__dirname, 'src/index.ts')], // 入口文件
    bundle: true,
    outfile: path.resolve(__dirname, '../../dist/js/validators.js'),
    // outfile: 'lib/index.js',
    platform: 'browser', // 设置为浏览器平台
    target: 'esnext', // 根据需要选择目标
    minify: false, // 不压缩
    charset: 'utf8', // 确保使用 UTF-8 编码
}).catch(() => process.exit(1));