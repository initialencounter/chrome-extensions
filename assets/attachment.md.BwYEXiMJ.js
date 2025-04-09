import{_ as a,c as t,o as l,ae as r}from"./chunks/framework.Dh1jimFm.js";const o="/assets/deepseek_platform.CqAR53d9.png",i="/assets/deepseek_config.CbbCl1w1.png",f=JSON.parse('{"title":"验证图片和概要","description":"","frontmatter":{},"headers":[],"relativePath":"attachment.md","filePath":"attachment.md"}'),c={name:"attachment.md"};function n(s,e,h,d,p,m){return l(),t("div",null,e[0]||(e[0]=[r('<h1 id="验证图片和概要" tabindex="-1">验证图片和概要 <a class="header-anchor" href="#验证图片和概要" aria-label="Permalink to &quot;验证图片和概要&quot;">​</a></h1><h2 id="功能介绍" tabindex="-1">功能介绍 <a class="header-anchor" href="#功能介绍" aria-label="Permalink to &quot;功能介绍&quot;">​</a></h2><ul><li>通过 <code>Everything</code> 工具，搜索图片概要。</li><li>再调用解析器读取图片概要，与系统检验单进行匹配。</li></ul><h2 id="前置条件" tabindex="-1">前置条件 <a class="header-anchor" href="#前置条件" aria-label="Permalink to &quot;前置条件&quot;">​</a></h2><ul><li>安装解析器。 <ul><li>方法一：安装图形化界面。</li><li>方法二：直接运行可执行文件。</li></ul></li><li>设置 <code>Everything</code> 服务。</li><li><code>v1.8.9</code> 以上版本的 <code>lims</code> 插件 。</li></ul><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><h3 id="方法一-安装-tauri-版本。" tabindex="-1">方法一：安装 tauri 版本。 <a class="header-anchor" href="#方法一-安装-tauri-版本。" aria-label="Permalink to &quot;方法一：安装 tauri 版本。&quot;">​</a></h3><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>此版本内存占用低性能高，但兼容性不足，如果安装后无法打开，请尝试方法二。</p></div><p><a href="https://github.com/initialencounter/Aircraft/releases/download/v0.6.0/aircraft_0.6.0_x64_zh-CN.msi" target="_blank" rel="noreferrer">点我下载</a></p><ol><li>退出所有杀毒软件</li><li>双击安装包，进行安装。</li><li>安装完成后，双击桌面快捷方式 <code>aircraft</code> ，运行程序。</li></ol><h3 id="方法二-安装-electron-版本。" tabindex="-1">方法二：安装 electron 版本。 <a class="header-anchor" href="#方法二-安装-electron-版本。" aria-label="Permalink to &quot;方法二：安装 electron 版本。&quot;">​</a></h3><p><a href="https://github.com/initialencounter/Aircraft/releases/download/v0.6.0/aircraft_0.6.0_electron_x64-setup.exe" target="_blank" rel="noreferrer">点我下载</a></p><ol><li>双击安装程序，进行安装。</li></ol><h3 id="设置-everything-服务" tabindex="-1">设置 Everything 服务 <a class="header-anchor" href="#设置-everything-服务" aria-label="Permalink to &quot;设置 Everything 服务&quot;">​</a></h3><ol><li>打开 <code>Everything</code> 选项。</li><li>启用 <code>HTTP服务器</code> 。</li><li>将 <code>HTTP服务端口</code> 设置为 <code>25456</code> 。</li><li>点击 <code>应用</code> 按钮。</li></ol><h3 id="更新-lims-插件" tabindex="-1">更新 lims 插件 <a class="header-anchor" href="#更新-lims-插件" aria-label="Permalink to &quot;更新 lims 插件&quot;">​</a></h3><p>点击验证按钮，验证图片概要。</p><h2 id="大模型配置" tabindex="-1">大模型配置 <a class="header-anchor" href="#大模型配置" aria-label="Permalink to &quot;大模型配置&quot;">​</a></h2><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>此功能需要 <code>v2.0.0</code> 以上版本的 <code>lims</code> 插件。</p></div><p>前往<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer">deepseek</a>（推荐）或 <a href="https://platform.moonshot.cn/console/api-keys" target="_blank" rel="noreferrer">moonshot</a> 开放平台，创建 API-KEY</p><p><img src="'+o+'" alt="deepseek platform"></p><p>填入大模型配置，并重载配置</p><p>如果是 deepseek 平台申请的 apikey</p><ul><li>平台接口域名：<a href="https://api.deepseek.com" target="_blank" rel="noreferrer">https://api.deepseek.com</a></li><li>API key: 申请创建的 APIKEY</li><li>模型： deepseek-chat <img src="'+i+'" alt="llm config"></li></ul><p>如果是 moonshot 则填写</p><ul><li>平台接口域名：<a href="https://api.moonshot.cn/v1" target="_blank" rel="noreferrer">https://api.moonshot.cn/v1</a></li><li>API key: 申请创建的 APIKEY</li><li>模型： moonshot-v1-32k</li></ul><p>配置好之后将 UN 报告拖入检验单页面，即可让大模型来核对概要与 UN 报告的信息</p>',27)]))}const _=a(c,[["render",n]]);export{f as __pageData,_ as default};
