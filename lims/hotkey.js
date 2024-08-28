console.log("快捷键脚本运行中...");

// auto open document
(async function () {
    await sleep(200);
    // 复制报告编号
    document.getElementById('projectNo').parentElement.addEventListener('click', setProjectNoToClipText);
    // 复制项目名称
    document.getElementById('itemCName').parentElement.addEventListener('click', copyProjectName);
    // // 搜索模式不打开资料
    // if (window.location.href.includes('from=query')) {
    //     return;
    // }
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // const pid = urlParams.get('projectId');
    // const host = window.location.host;
    // const url = `https://${host}/document?pid=${pid}`;
    // const link = document.createElement('a');
    // link.href = url;

    // const event = new MouseEvent('click', {
    //     ctrlKey: true,
    //     bubbles: true,
    //     cancelable: true
    // });

    // // 将事件派发到 a 标签
    // link.dispatchEvent(event);
})();

let ctrlPressCount = 0;
let lastCtrlPressTime = 0;

let cPressCount = 0;
let lastCPressTime = 0;

// 监听 Ctrl 键的弹起事件
document.addEventListener('keyup', function (event) {
    if (event.key === 'Control') {
        // 双击 Ctrl 键的检测
        const currentTime = new Date().getTime();
        // 检查两次 Ctrl 按键的时间间隔
        if (currentTime - lastCtrlPressTime < 500) { // 500毫秒内双击认为是双击
            ctrlPressCount++;
        } else {
            ctrlPressCount = 1; // 超过时间间隔，重置计数
        }
        lastCtrlPressTime = currentTime;
        // 当双击 Ctrl 键时触发的事件
        if (ctrlPressCount === 2) {
            setProjectNoToClipText();
            // 触发一次双击事件后重置计数
            ctrlPressCount = 0;
        }
    }
    if (event.key === 'c') {
        const currentTime = new Date().getTime();
        if (currentTime - lastCPressTime < 500) {
            cPressCount++;
        } else {
            cPressCount = 1;
        }
        lastCPressTime = currentTime;
        if (cPressCount === 2 && event.ctrlKey) {
            copyProjectName();
            cPressCount = 0;
        }
    }
    
});

// 监听 Ctrl + S 的按下事件
document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey) {
        return;
    }
    // 检查是否按下了Ctrl+S
    if (event.key === 's') {
        event.preventDefault(); // 阻止默认的保存行为
        myCustomSaveFunction();
    }
    if (event.key === 'd') {
        event.preventDefault(); // 阻止默认的保存行为
        importDocument();
    }
});

function myCustomSaveFunction() {
    const button = document.getElementById('saveBtn0');
    // Fork From https://github.com/snwjas/Message.js
    if (button) {
        button.click();
        Qmsg['success']('保存成功');
    } else {
        console.log('Button not found');
        Qmsg['error']('保存失败');
    }
}

function importDocument() {
    const button = document.getElementById('importBtn0');
    if (button) {
        button.click();
    } else {
        console.log('Button not found');
    }
}

function copyProjectName() {
    const projectNameSpan = document.getElementById('itemCName');
    const projectName = projectNameSpan.value;
    console.log(projectName);
    navigator.clipboard.writeText(projectName);
    Qmsg['success']('已复制项目名称');
}