import{_ as l,c as e,a0 as i,o as r}from"./chunks/framework.CGHvQLJz.js";const q=JSON.parse('{"title":"更新日志","description":"","frontmatter":{},"headers":[],"relativePath":"changelog.md","filePath":"changelog.md"}'),h={name:"changelog.md"};function t(o,a,n,d,u,c){return r(),e("div",null,a[0]||(a[0]=[i('<h1 id="更新日志" tabindex="-1">更新日志 <a class="header-anchor" href="#更新日志" aria-label="Permalink to &quot;更新日志&quot;">​</a></h1><h2 id="v1-5-11-2024-11-06" tabindex="-1">[v1.5.11] - 2024-11-06 <a class="header-anchor" href="#v1-5-11-2024-11-06" aria-label="Permalink to &quot;[v1.5.11] - 2024-11-06&quot;">​</a></h2><h3 id="修复" tabindex="-1">修复 <a class="header-anchor" href="#修复" aria-label="Permalink to &quot;修复&quot;">​</a></h3><ul><li>初验 <ul><li>导入时，结算方式不能自动勾选月结</li></ul></li><li>样品检验 <ul><li>967/970, 966/969 第II部分勾选堆码后仍然提示未勾选</li><li>Ctrl+S 快捷键保存后，仍提示为保存</li><li>无法关闭导入快捷键</li></ul></li><li>其他 <ul><li>修改备注后，无法设置颜色</li></ul></li></ul><h2 id="新增" tabindex="-1">新增 <a class="header-anchor" href="#新增" aria-label="Permalink to &quot;新增&quot;">​</a></h2><ul><li>支持导入导出配置</li><li>支持自定义初验内容</li><li>部分功能适配化学品</li></ul><h2 id="v1-5-9-2024-11-05" tabindex="-1">[v1.5.9] - 2024-11-05 <a class="header-anchor" href="#v1-5-9-2024-11-05" aria-label="Permalink to &quot;[v1.5.9] - 2024-11-05&quot;">​</a></h2><h3 id="新增-1" tabindex="-1">新增 <a class="header-anchor" href="#新增-1" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>支持自定义下一年报告字体颜色，和背景颜色</li></ul><h2 id="v1-5-8-2024-11-05" tabindex="-1">[v1.5.8] - 2024-11-05 <a class="header-anchor" href="#v1-5-8-2024-11-05" aria-label="Permalink to &quot;[v1.5.8] - 2024-11-05&quot;">​</a></h2><h3 id="新增-2" tabindex="-1">新增 <a class="header-anchor" href="#新增-2" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>增大海运的其他描述的输入框尺寸。</li><li>堆码验证。当 967/970, 966/969 第II部分未勾堆码或堆码评估，点击验证按钮将弹出提示</li></ul><h2 id="v1-5-7-2024-11-04" tabindex="-1">[v1.5.7] - 2024-11-04 <a class="header-anchor" href="#v1-5-7-2024-11-04" aria-label="Permalink to &quot;[v1.5.7] - 2024-11-04&quot;">​</a></h2><h3 id="新增-3" tabindex="-1">新增 <a class="header-anchor" href="#新增-3" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>导入时，自动勾选标记为明年报告。</li></ul><h2 id="v1-5-6-2024-11-01" tabindex="-1">[v1.5.6] - 2024-11-01 <a class="header-anchor" href="#v1-5-6-2024-11-01" aria-label="Permalink to &quot;[v1.5.6] - 2024-11-01&quot;">​</a></h2><h3 id="改进" tabindex="-1">改进 <a class="header-anchor" href="#改进" aria-label="Permalink to &quot;改进&quot;">​</a></h3><ul><li>导入搜索时添加月份（为上一个月），以减少搜索时间。 如果这个改动不符合您出报告的习惯，可以打开插件的 <code>dist/js/hotkey.js</code> 文件 搜索 <code>qProjectNo.value = getMonthsAgoProjectNo();</code>, 将其替换为 <code>qProjectNo.value = systemId;</code> 注意别漏了分号，保存后重新加载插件。</li></ul><h2 id="v1-5-5-2024-10-24" tabindex="-1">[v1.5.5] - 2024-10-24 <a class="header-anchor" href="#v1-5-5-2024-10-24" aria-label="Permalink to &quot;[v1.5.5] - 2024-10-24&quot;">​</a></h2><h3 id="新增-4" tabindex="-1">新增 <a class="header-anchor" href="#新增-4" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>实现验证上传资料功能，当未上传资料时或上传资料错误时，点击验证按钮将弹出提示。</li></ul><h3 id="改进-1" tabindex="-1">改进 <a class="header-anchor" href="#改进-1" aria-label="Permalink to &quot;改进&quot;">​</a></h3><ul><li>增大电池尺寸的输入框尺寸。</li></ul><h2 id="v1-5-4-2024-09-24" tabindex="-1">[v1.5.4] - 2024-09-24 <a class="header-anchor" href="#v1-5-4-2024-09-24" aria-label="Permalink to &quot;[v1.5.4] - 2024-09-24&quot;">​</a></h2><h3 id="修复-1" tabindex="-1">修复 <a class="header-anchor" href="#修复-1" aria-label="Permalink to &quot;修复&quot;">​</a></h3><ul><li>导入前搜索检验单时，当剪切板存在完整的项目编号时，去除搜索的预设。</li></ul><h2 id="v1-5-3-2024-09-11" tabindex="-1">[v1.5.3] - 2024-09-11 <a class="header-anchor" href="#v1-5-3-2024-09-11" aria-label="Permalink to &quot;[v1.5.3] - 2024-09-11&quot;">​</a></h2><h3 id="修复-2" tabindex="-1">修复 <a class="header-anchor" href="#修复-2" aria-label="Permalink to &quot;修复&quot;">​</a></h3><ul><li>修复初验改变运输方式时，金额设置失败。</li></ul><h2 id="v1-5-2-2024-09-10" tabindex="-1">[v1.5.2] - 2024-09-10 <a class="header-anchor" href="#v1-5-2-2024-09-10" aria-label="Permalink to &quot;[v1.5.2] - 2024-09-10&quot;">​</a></h2><h3 id="修复-3" tabindex="-1">修复 <a class="header-anchor" href="#修复-3" aria-label="Permalink to &quot;修复&quot;">​</a></h3><ul><li>修复导入后没有重新设置金额。</li></ul><h2 id="v1-5-1-2024-09-09" tabindex="-1">[v1.5.1] - 2024-09-09 <a class="header-anchor" href="#v1-5-1-2024-09-09" aria-label="Permalink to &quot;[v1.5.1] - 2024-09-09&quot;">​</a></h2><h3 id="新增-5" tabindex="-1">新增 <a class="header-anchor" href="#新增-5" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>将一键退回作为可选项。</li></ul><h2 id="v1-5-0-2024-09-05" tabindex="-1">[v1.5.0] - 2024-09-05 <a class="header-anchor" href="#v1-5-0-2024-09-05" aria-label="Permalink to &quot;[v1.5.0] - 2024-09-05&quot;">​</a></h2><h3 id="新增-6" tabindex="-1">新增 <a class="header-anchor" href="#新增-6" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>实现一键退回功能。</li></ul><h2 id="v1-4-0-2024-09-05" tabindex="-1">[v1.4.0] - 2024-09-05 <a class="header-anchor" href="#v1-4-0-2024-09-05" aria-label="Permalink to &quot;[v1.4.0] - 2024-09-05&quot;">​</a></h2><h3 id="新增-7" tabindex="-1">新增 <a class="header-anchor" href="#新增-7" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>实现表单验证功能（检验单右上角）。 验证规则详见 <a href="/rule.html">验证规则</a>，欢迎补充</li></ul><h2 id="v1-3-0-2024-09-05" tabindex="-1">[v1.3.0] - 2024-09-05 <a class="header-anchor" href="#v1-3-0-2024-09-05" aria-label="Permalink to &quot;[v1.3.0] - 2024-09-05&quot;">​</a></h2><h3 id="新增-8" tabindex="-1">新增 <a class="header-anchor" href="#新增-8" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>实现一键分配功能。</li></ul><h2 id="v1-0-0-2024-08-29" tabindex="-1">[v1.0.0] - 2024-08-29 <a class="header-anchor" href="#v1-0-0-2024-08-29" aria-label="Permalink to &quot;[v1.0.0] - 2024-08-29&quot;">​</a></h2><h3 id="新增-9" tabindex="-1">新增 <a class="header-anchor" href="#新增-9" aria-label="Permalink to &quot;新增&quot;">​</a></h3><ul><li>使用报告编号搜索时可以自动删除输入的非法字符，如空格。</li><li>搜索的报告日期范围会根据输入的编号中的日期来自动设置，无需手动设置日期，前提是这个报告编号是一个完整的编号。</li><li>查询检验单时可以自动设置运输方式</li><li>检验单发生改动时，关闭页面将提示未保存，会在标题前面加上星号 #1</li><li>标签页面标题显示为项目编号</li></ul>',47)]))}const b=l(h,[["render",t]]);export{q as __pageData,b as default};
