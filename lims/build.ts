/// <reference types='node' />

import path from 'path';
import esbuild from 'esbuild';

type Permission = 'accessibilityFeatures.modify'
    | 'accessibilityFeatures.read'
    | 'activeTab'
    | 'alarms'
    | 'audio'
    | 'background'
    | 'bookmarks'
    | 'browsingData'
    | 'certificateProvider'
    | 'clipboardRead'
    | 'clipboardWrite'
    | 'contentSettings'
    | 'contextMenus'
    | 'cookies'
    | 'debugger'
    | 'declarativeContent'
    | 'declarativeNetRequest'
    | 'declarativeNetRequestWithHostAccess'
    | 'declarativeNetRequestFeedback'
    | 'dns'
    | 'desktopCapture'
    | 'documentScan'
    | 'downloads'
    | 'downloads.open'
    | 'downloads.ui'
    | 'enterprise.deviceAttributes'
    | 'enterprise.hardwarePlatform'
    | 'enterprise.networkingAttributes'
    | 'enterprise.platformKeys'
    | 'favicon'
    | 'fileBrowserHandler'
    | 'fileSystemProvider'
    | 'fontSettings'
    | 'gcm'
    | 'geolocation'
    | 'history'
    | 'identity'
    | 'identity.email'
    | 'idle'
    | 'loginState'
    | 'management'
    | 'nativeMessaging'
    | 'notifications'
    | 'offscreen'
    | 'pageCapture'
    | 'platformKeys'
    | 'power'
    | 'printerProvider'
    | 'printing'
    | 'printingMetrics'
    | 'privacy'
    | 'processes'
    | 'proxy'
    | 'readingList'
    | 'runtime'
    | 'scripting'
    | 'search'
    | 'sessions'
    | 'sidePanel'
    | 'storage'
    | 'system.cpu'
    | 'system.display'
    | 'system.memory'
    | 'system.storage'
    | 'tabCapture'
    | 'tabGroups'
    | 'tabs'
    | 'topSites'
    | 'tts'
    | 'ttsEngine'
    | 'unlimitedStorage'
    | 'vpnProvider'
    | 'wallpaper'
    | 'webAuthenticationProxy'
    | 'webNavigation'
    | 'webRequest'
    | 'webRequestBlocking';

interface ManiFest {
    manifest_version: 3
    name: string,
    version: string,
    description: string,
    icons: {
        '48': string
    }
    permissions: Permission[]
    host_permissions: string[]
    action: {
        default_popup: string
    }
    options_page: string
    content_scripts: ContentScript[]
}
interface FireFoxManifet extends ManiFest {
    browser_specific_settings: {
        gecko: {
            id: string;
        }
    }
    background: {
        scripts: string[],
        type: string;
    }
}
interface ChromeManifest extends ManiFest {
    '$schema': string,
    background: {
        service_worker: string;
        type: string;
    }
}
interface ContentScript {
    run_at?: string;
    matches: string[];
    all_frames?: boolean;
    css?: string[];
    js?: string[];
}

function buildContentScript() {
    for (let entry of [
        'home',
        'query',
        'hotkey',
        'entrust',
        'entrustMain',
        'verify',
        'rollback',
        'checkList',
        'entrustEname',
        'entrustImport',
    ]) {
        console.log(`正在编译 ${entry}`);
        let entryPath = path.resolve(__dirname, `./src/content-script/${entry}.ts`);
        esbuild.build({
            entryPoints: [entryPath], // 入口文件
            bundle: true,
            outfile: path.resolve(__dirname, './dist/js', `${entry}.js`),
            platform: 'browser', // 设置为浏览器平台
            target: 'esnext', // 根据需要选择目标
            minify: false, // 不压缩
            charset: 'utf8', // 确保使用 UTF-8 编码
        }).catch(() => process.exit(1));
    }
}

// background.js
function buildBackground() {
    console.log('正在编译 background');
    esbuild.build({
        entryPoints: [path.resolve(__dirname, './src/background/index.ts')], // 入口文件
        bundle: true,
        outfile: path.resolve(__dirname, './dist/js', 'background.js'),
        platform: 'browser', // 设置为浏览器平台
        target: 'esnext', // 根据需要选择目标
        minify: false, // 不压缩
        charset: 'utf8', // 确保使用 UTF-8 编码
    }).catch(() => process.exit(1));
}



const content_scripts: ContentScript[] = [
    {
        run_at: 'document_end',
        matches: [
            'https://*/rek/inspect*',
            'https://*/aek/inspect*',
            'https://*/sek/inspect*',
            'https://*/pek/inspect*'
        ],
        all_frames: true,
        css: [
            'assets/message.min.css'
        ],
        js: [
            'js/validators.js',
            'js/hotkey.js',
            'assets/message.min.mjs',
            'js/checkList.js',
            'js/verify.js'
        ]
    },
    {
        run_at: 'document_end',
        matches: [
            'https://*/inspect/query/main'
        ],
        all_frames: true,
        js: [
            'js/query.js'
        ]
    },


    // 业务受理
    { 
        run_at: 'document_end',
        matches: [
            'https://*/sales/entrust/list'
        ],
        all_frames: true,
        css: [
            'assets/message.min.css'
        ],
        js: [
            'js/entrust.js',
            'assets/message.min.mjs'
        ]
    },
    // 主页
    {
        run_at: 'document_end',
        matches: [
            'https://*/'
        ],
        all_frames: true,
        js: [
            'js/home.js',
        ]
    },
    // 初验
    {
        run_at: 'document_end',
        matches: [
            'https://*/sales/entrust/main'
        ],
        css: [
            'assets/message.min.css'
        ],
        all_frames: true,
        js: [
            'js/entrustMain.js',
            'js/entrustEname.js',
            'assets/message.min.mjs'
        ]
    },
    {
        run_at: 'document_end',
        matches: [
            'https://*/sales/entrust/dict/main?callback=entrust_dict_callback'
        ],
        all_frames: true,
        js: [
            'js/entrustImport.js'
        ]
    },
    {
        run_at: 'document_end',
        matches: [
            'https://*/flow/inspect/inspect/main'
        ],
        all_frames: true,
        css: [
            'assets/message.min.css'
        ],
        js: [
            'js/rollback.js',
            'assets/message.min.mjs'
        ]
    }
]
const manifest: ManiFest = {
    manifest_version: 3,
    name: 'lims',
    version: '1.8.13',
    description: 'tools for own use',
    icons: {
        '48': 'assets/icons/lims.png'
    },
    permissions: [
        'activeTab',
        'clipboardWrite',
        'scripting',
        'storage',
        'contextMenus'
    ],
    host_permissions: [
        '<all_urls>'
    ],
    action: {
        default_popup: 'popup/index.html'
    },
    options_page: 'options/index.html',
    content_scripts
}
function buildManifest() {
    let json = manifest as ChromeManifest
    json.$schema = 'https://json.schemastore.org/chrome-manifest.json'
    json.background = {
        service_worker: 'js/background.js',
        type: 'module'
    };
    require('fs').writeFileSync(
        path.resolve(__dirname, './dist/manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
}

function buildManifestFireFox() {
    let json = manifest as FireFoxManifet
    json.background = {
        scripts: [
            'js/background.js'
        ],
        type: 'module'
    };
    json.browser_specific_settings = {
        gecko: {
            id: '{3f8b9a12-a64d-48d8-bb5c-8d9f4e9322b2}'
        }
    }
    require('fs').writeFileSync(
        path.resolve(__dirname, './dist/manifest.firefox.json'),
        JSON.stringify(manifest, null, 2)
    );
}

buildBackground()
buildContentScript()
buildManifestFireFox()
buildManifest()