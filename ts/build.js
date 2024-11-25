// build.js
require('esbuild').build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'C:\\Users\\29115\\dev\\chrome\\chrome-extensions\\lims\\src\\public\\js\\validators.js',
    // outfile: 'lib/index.js',
    platform: 'browser', // 设置为浏览器平台
    target: 'esnext', // 根据需要选择目标
    minify: false, // 不压缩
    charset: 'utf8', // 确保使用 UTF-8 编码
}).catch(() => process.exit(1));